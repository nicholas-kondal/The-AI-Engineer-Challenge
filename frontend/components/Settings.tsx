'use client';

import React, { useState } from 'react';
import { Settings as SettingsIcon, Eye, EyeOff } from 'lucide-react';
import { Settings as SettingsType } from '@/types';

interface SettingsProps {
  settings: SettingsType;
  onSettingsChange: (settings: SettingsType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const Settings: React.FC<SettingsProps> = ({ 
  settings, 
  onSettingsChange, 
  isOpen, 
  onToggle 
}) => {
  const [showApiKey, setShowApiKey] = useState(false);

  const handleChange = (field: keyof SettingsType, value: string) => {
    onSettingsChange({
      ...settings,
      [field]: value
    });
  };

  return (
    <div className="settings-container">
      <button onClick={onToggle} className="settings-toggle">
        <SettingsIcon size={20} />
        Settings
      </button>
      
      {isOpen && (
        <div className="settings-panel">
          <div className="settings-section">
            <label htmlFor="apiKey">OpenAI API Key</label>
            <div className="api-key-input">
              <input
                id="apiKey"
                type={showApiKey ? "text" : "password"}
                value={settings.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="sk-..."
                className="settings-input"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="toggle-password"
              >
                {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <div className="api-key-help">
              <p>💡 <strong>Required:</strong> Enter your OpenAI API key to use the chat</p>
              <p>🔒 <strong>Secure:</strong> Your key is only sent to the backend and never stored</p>
            </div>
          </div>

          <div className="settings-section">
            <label htmlFor="model">Model</label>
            <select
              id="model"
              value={settings.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="settings-input"
            >
              <option value="gpt-4.1-mini">GPT-4.1 Mini</option>
              <option value="gpt-4.1-nano">GPT-4.1 Nano</option>
              <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            </select>
          </div>

          <div className="settings-section">
            <label htmlFor="developerMessage">System Message</label>
            <textarea
              id="developerMessage"
              value={settings.developerMessage}
              onChange={(e) => handleChange('developerMessage', e.target.value)}
              placeholder="Enter a system message to guide the AI's behavior..."
              className="settings-textarea"
              rows={3}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
