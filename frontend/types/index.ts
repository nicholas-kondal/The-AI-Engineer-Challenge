// Type definitions for the chat interface

export interface ChatRequest {
  developer_message: string;
  user_message: string;
  model?: string;
  api_key: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
}

export interface Settings {
  apiKey: string;
  model: string;
  developerMessage: string;
}
