'use client';

import { useState, useEffect, useRef } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatInput from '@/components/ChatInput';
import Settings from '@/components/Settings';
import { ChatMessage as ChatMessageType, Settings as SettingsType } from '@/types';
import { chatAPI } from '@/lib/api';
import { MessageCircle, Loader2 } from 'lucide-react';
import './ChatInterface.css';

export default function ChatInterface() {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<SettingsType>({
    apiKey: '',
    model: 'gpt-4o-mini',
    developerMessage: 'You are a helpful AI assistant.'
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check API health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        await chatAPI.healthCheck();
      } catch (err) {
        setError('Backend server is not running. Please start the FastAPI server.');
      }
    };
    checkHealth();
  }, []);

  const handleSendMessage = async (userMessage: string) => {
    if (!settings.apiKey.trim()) {
      setError('Please enter your OpenAI API key in settings.');
      return;
    }

    // Add user message to chat
    const userChatMessage: ChatMessageType = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userChatMessage]);
    setIsLoading(true);
    setError(null);

    try {
      // Create assistant message placeholder
      const assistantMessageId = (Date.now() + 1).toString();
      const assistantChatMessage: ChatMessageType = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantChatMessage]);

      // Send request to API
      const stream = await chatAPI.sendMessage({
        developer_message: settings.developerMessage,
        user_message: userMessage,
        model: settings.model,
        api_key: settings.apiKey
      });

      // Handle streaming response
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let hasContent = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        hasContent = true;

        // Normal content streaming
        setMessages(prev => 
          prev.map(msg => 
            msg.id === assistantMessageId 
              ? { ...msg, content: msg.content + chunk }
              : msg
          )
        );
      }

      // If we didn't get any content, it might be an empty response
      if (!hasContent) {
        setError('No response received from the AI. Please try again.');
        setMessages(prev => prev.filter(msg => msg.id !== assistantMessageId));
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      // Remove the assistant message if there was an error
      setMessages(prev => prev.filter(msg => msg.role !== 'assistant' || msg.content !== ''));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingsChange = (newSettings: SettingsType) => {
    setSettings(newSettings);
    // Clear any previous errors when settings change
    if (error && error.includes('API key')) {
      setError(null);
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const hasApiKey = settings.apiKey.trim().length > 0;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-left">
            <MessageCircle size={24} />
            <h1>OpenAI Chat Interface</h1>
          </div>
          <div className="header-right">
            <button onClick={clearChat} className="clear-button">
              Clear Chat
            </button>
            <Settings
              settings={settings}
              onSettingsChange={handleSettingsChange}
              isOpen={settingsOpen}
              onToggle={() => setSettingsOpen(!settingsOpen)}
            />
          </div>
        </div>
      </header>

      <main className="chat-container">
        <div className="messages-container">
          {messages.length === 0 && !isLoading && !error && (
            <div className="welcome-message">
              <MessageCircle size={48} />
              <h2>Welcome to OpenAI Chat!</h2>
              <p>Start a conversation by typing a message below.</p>
              {hasApiKey ? (
                <p className="env-key-notice">✅ API key configured successfully</p>
              ) : (
                <p className="error-notice">❌ Please configure your API key in settings</p>
              )}
            </div>
          )}

          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="loading-message">
              <Loader2 size={20} className="loading-spinner" />
              <span>AI is thinking...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={isLoading || !hasApiKey}
          placeholder={!hasApiKey ? "Enter your API key in settings first..." : "Type your message..."}
        />
      </main>
    </div>
  );
}
