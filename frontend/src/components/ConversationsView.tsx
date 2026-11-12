import React, { useState, useEffect, useCallback } from 'react';
import { ConversationItem, fetchConversations, clearAllConversations } from '../api';

interface ConversationsViewProps {
  onLoadConversation: (conversationId: string) => void;
  currentConversationId: string | null;
}

export const ConversationsView: React.FC<ConversationsViewProps> = ({
  onLoadConversation,
  currentConversationId,
}) => {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const items = await fetchConversations();
      setConversations(items);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to load conversations from local SQLite.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleClearAll = async () => {
    if (
      !window.confirm(
        'Are you sure you want to PERMANENTLY clear all conversation history from the local database?\n\nThis cannot be undone.'
      )
    ) {
      return;
    }

    try {
      await clearAllConversations(true);
      await loadConversations();
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to clear conversation history.');
    }
  };

  return (
    <div className="jarvis-card conversations-view-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            SAVED CONVERSATION SESSIONS
          </h3>
          <p className="card-subtitle">
            Local multi-turn chat threads indexed in SQLite (`backend/data/jarvis.db`).
          </p>
        </div>

        {conversations.length > 0 && (
          <button className="hud-button hud-button-warn" onClick={handleClearAll}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
            Clear History
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="hud-alert-banner">
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="conversations-list">
        {isLoading ? (
          <div className="memory-loading">
            <span className="proc-dot"></span>
            <span className="proc-dot"></span>
            <span className="proc-dot"></span>
            <p>Scanning conversation indices...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="empty-memories">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
            <p>No stored conversations found.</p>
            <span>Send a message to JARVIS to create your first session.</span>
          </div>
        ) : (
          conversations.map((conv) => {
            const isCurrent = currentConversationId === conv.id;
            return (
              <div
                key={conv.id}
                className={`conversation-card ${isCurrent ? 'conv-active' : ''}`}
                onClick={() => onLoadConversation(conv.id)}
              >
                <div className="conv-main">
                  <div className="conv-title-row">
                    <span className="conv-title">{conv.title}</span>
                    {isCurrent && <span className="active-session-pill">CURRENT SESSION</span>}
                  </div>
                  <span className="conv-id">ID: {conv.id}</span>
                </div>
                <div className="conv-meta">
                  <span className="conv-time">
                    {new Date(conv.updated_at).toLocaleString()}
                  </span>
                  <span className="conv-resume-link">Resume &rarr;</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
