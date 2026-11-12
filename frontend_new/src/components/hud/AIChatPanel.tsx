import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage, AIState } from '../../types';

interface AIChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (msg: string) => void;
  isLoading: boolean;
  aiState: AIState;
}

export const AIChatPanel: React.FC<AIChatPanelProps> = ({
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleSuggestionClick = (promptText: string) => {
    if (isLoading) return;
    onSendMessage(promptText);
  };

  return (
    <div className="hud-panel panel-chat" aria-label="AI Chat Interface">
      <div className="hud-panel-header">
        <span className="hud-panel-title">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          AI CHAT INTERFACE
        </span>
        <div className="hud-panel-controls">
          <span className="panel-btn" title="Minimize">&mdash;</span>
          <span className="panel-btn" title="Maximize">&#9633;</span>
          <span className="panel-btn" title="Close">&times;</span>
        </div>
      </div>

      <div className="chat-messages-container" ref={scrollRef}>
        <div className="chat-bubble chat-bubble-assistant">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--cyan)', fontWeight: 700, fontSize: '11px' }}>JARVIS Core</span>
            <span style={{ color: 'var(--text-secondary)', fontSize: '9px' }}>AI Assistant</span>
          </div>
          <div>Hello! I'm <strong>JARVIS</strong>. Your AI assistant is ready.</div>
        </div>

        {messages.map((m) => (
          <div
            key={m.id}
            className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}`}
          >
            <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '2px' }}>
              {m.role === 'user' ? 'YOU' : 'JARVIS'} &bull; {m.time}
            </div>
            <div>{m.content}</div>
          </div>
        ))}

        {isLoading && (
          <div className="chat-bubble chat-bubble-assistant" style={{ fontStyle: 'italic', color: 'var(--cyan-light)' }}>
            <span className="pulse-dot" style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--cyan)', marginRight: '6px' }} />
            Synthesizing neural response via Gemini...
          </div>
        )}

        {messages.length === 0 && (
          <div className="chat-suggestions-box">
            <button
              className="sug-chip"
              onClick={() => handleSuggestionClick('Optimize your system')}
            >
              &gt; Optimize your system
            </button>
            <button
              className="sug-chip"
              onClick={() => handleSuggestionClick('Write or debug code')}
            >
              &gt; Write or debug code
            </button>
            <button
              className="sug-chip"
              onClick={() => handleSuggestionClick('Check my memory')}
            >
              &gt; Check my memory
            </button>
            <button
              className="sug-chip"
              onClick={() => handleSuggestionClick('Inspect Mac hardware')}
            >
              &gt; Inspect Mac hardware
            </button>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          className="chat-text-input"
          placeholder="Type your message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
        />
        <button
          type="submit"
          className="chat-send-btn"
          disabled={!inputText.trim() || isLoading}
          title="Send Directive"
          aria-label="Send Message"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13"></line>
            <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
          </svg>
        </button>
      </form>
    </div>
  );
};
