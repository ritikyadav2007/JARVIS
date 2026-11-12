import React, { useState, useRef, useEffect } from 'react';
import { LogEntry } from '../types';

interface ChatViewProps {
  logs: LogEntry[];
  inputText: string;
  setInputText: (text: string) => void;
  onSendMessage: (e?: React.FormEvent) => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleVoice: () => void;
  onSpeakText: (text: string) => void;
  isSpeaking: boolean;
  onStopSpeaking: () => void;
  conversationId: string | null;
  onClearConversation?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  logs,
  inputText,
  setInputText,
  onSendMessage,
  isLoading,
  isListening,
  onToggleVoice,
  onSpeakText,
  isSpeaking,
  onStopSpeaking,
  conversationId,
  onClearConversation,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="jarvis-card chat-view-card">
      {/* Header */}
      <div className="chat-view-header">
        <div className="chat-header-info">
          <h3 className="chat-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            TACTICAL AI COMM CONSOLE
          </h3>
          <span className="chat-session-badge">
            {conversationId ? `SESSION: ${conversationId}` : 'SESSION: ACTIVE'}
          </span>
        </div>

        <div className="chat-header-actions">
          {isSpeaking && (
            <button className="hud-button hud-button-warn" onClick={onStopSpeaking}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
              Mute Speech
            </button>
          )}

          {onClearConversation && (
            <button className="hud-button-subtle" onClick={onClearConversation} title="Clear Screen Messages">
              Clear Screen
            </button>
          )}
        </div>
      </div>

      {/* Message List */}
      <div className="chat-messages-container">
        {logs.map((log) => {
          const isUser = log.type === 'user';
          const isAssistant = log.type === 'assistant';
          const isWarning = log.type === 'warning';

          return (
            <div
              key={log.id}
              className={`chat-bubble-row ${isUser ? 'row-user' : isAssistant ? 'row-assistant' : 'row-system'}`}
            >
              <div className={`chat-bubble ${isUser ? 'bubble-user' : isAssistant ? 'bubble-assistant' : 'bubble-system'}`}>
                {/* Bubble Header */}
                <div className="bubble-meta">
                  <span className="bubble-sender">
                    {isUser ? 'YOU' : isAssistant ? 'J.A.R.V.I.S.' : isWarning ? 'ALERT' : 'CORE'}
                  </span>
                  <span className="bubble-time">{log.time}</span>
                </div>

                {/* Bubble Content */}
                <div className="bubble-text">{log.message}</div>

                {/* Bubble Actions for Assistant */}
                {isAssistant && (
                  <div className="bubble-actions">
                    <button
                      className="bubble-action-btn"
                      onClick={() => handleCopy(log.id, log.message)}
                      title="Copy response to clipboard"
                    >
                      {copiedId === log.id ? (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span style={{ color: '#10b981' }}>Copied</span>
                        </>
                      ) : (
                        <>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      className="bubble-action-btn"
                      onClick={() => onSpeakText(log.message)}
                      title="Play response via Voice Synthesizer"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                      <span>Vocalize</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="chat-bubble-row row-assistant">
            <div className="chat-bubble bubble-assistant bubble-loading">
              <span className="bubble-sender">J.A.R.V.I.S.</span>
              <div className="processing-wave">
                <span className="proc-dot"></span>
                <span className="proc-dot"></span>
                <span className="proc-dot"></span>
                <span className="proc-text">Synthesizing intelligence...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* Input Bar */}
      <form onSubmit={onSendMessage} className="chat-input-bar">
        {/* Push-to-talk button */}
        <button
          type="button"
          onClick={onToggleVoice}
          className={`voice-mic-button ${isListening ? 'mic-active' : ''}`}
          title={isListening ? 'Click to stop listening' : 'Push-to-talk Voice Input'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
          </svg>
        </button>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={isLoading}
          placeholder={
            isListening
              ? 'Listening for voice input...'
              : isLoading
              ? 'JARVIS is thinking...'
              : 'Type an instruction or command for JARVIS...'
          }
          className="chat-text-input"
        />

        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="chat-send-button"
        >
          {isLoading ? (
            <span className="loader-dots">...</span>
          ) : (
            <>
              <span>Send</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
