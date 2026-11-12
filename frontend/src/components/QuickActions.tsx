import React from 'react';
import { ActiveView } from '../types';

interface QuickActionsProps {
  onSelectView: (view: ActiveView) => void;
  onQuickPrompt: (prompt: string) => void;
  onOpenAddMemoryModal: () => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  onSelectView,
  onQuickPrompt,
  onOpenAddMemoryModal,
}) => {
  return (
    <div className="jarvis-card quick-actions-card">
      <div className="card-header">
        <h4 className="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          TACTICAL QUICK ACTIONS
        </h4>
        <span className="telemetry-badge">SHORTCUTS</span>
      </div>

      <div className="action-buttons-grid">
        <button
          className="hud-action-card"
          onClick={() => {
            onSelectView('chat');
            onQuickPrompt('JARVIS, run a full system diagnostics check.');
          }}
        >
          <div className="action-icon text-cyan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div className="action-meta">
            <span className="action-name">Ask JARVIS</span>
            <span className="action-hint">Send a diagnostic instruction</span>
          </div>
        </button>

        <button
          className="hud-action-card"
          onClick={() => onSelectView('memory')}
        >
          <div className="action-icon text-emerald">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </div>
          <div className="action-meta">
            <span className="action-name">Search Memories</span>
            <span className="action-hint">Query local SQLite knowledge</span>
          </div>
        </button>

        <button
          className="hud-action-card"
          onClick={onOpenAddMemoryModal}
        >
          <div className="action-icon text-amber">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </div>
          <div className="action-meta">
            <span className="action-name">Add Memory</span>
            <span className="action-hint">Store an approved preference</span>
          </div>
        </button>

        <button
          className="hud-action-card"
          onClick={() => onSelectView('conversations')}
        >
          <div className="action-icon text-bright">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5"></polyline>
              <line x1="12" y1="19" x2="20" y2="19"></line>
            </svg>
          </div>
          <div className="action-meta">
            <span className="action-name">Open Conversations</span>
            <span className="action-hint">Review active chat sessions</span>
          </div>
        </button>

        <button
          className="hud-action-card"
          onClick={() => onSelectView('tools')}
        >
          <div className="action-icon text-cyan">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <div className="action-meta">
            <span className="action-name">Open Tools</span>
            <span className="action-hint">Mac utilities & diagnostics</span>
          </div>
        </button>
      </div>
    </div>
  );
};
