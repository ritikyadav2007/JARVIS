import React from 'react';
import type { ActiveView } from '../../types';

interface ShortcutsPanelProps {
  onTriggerAction: (actionName: string) => void;
  onNavigate: (view: ActiveView) => void;
}

export const ShortcutsPanel: React.FC<ShortcutsPanelProps> = ({
  onTriggerAction,
  onNavigate,
}) => {
  const handleUpdate = () => {
    onTriggerAction('System status verified. Core packages up to date.');
  };

  const handleClean = () => {
    if (window.confirm('Clear temporary frontend cache and reload metrics?')) {
      onTriggerAction('Temporary cache cleared. System metrics refreshed.');
    }
  };

  const handleInfo = () => {
    onNavigate('command-center');
    onTriggerAction('Displaying complete system telemetry and specifications.');
  };

  const handleBackup = () => {
    onNavigate('memory');
    onTriggerAction('Opening persistent memory and SQLite backup vault.');
  };

  return (
    <div className="hud-panel panel-shortcuts" aria-label="Quick Shortcuts">
      <div className="hud-panel-header">
        <span className="hud-panel-title">SHORTCUTS</span>
        <div className="hud-panel-controls">
          <span className="panel-btn" title="Minimize">&mdash;</span>
          <span className="panel-btn" title="Maximize">&#9633;</span>
          <span className="panel-btn" title="Close">&times;</span>
        </div>
      </div>

      <div className="shortcuts-4-grid">
        <button className="shortcut-btn" onClick={handleUpdate} title="Update System">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
          </svg>
          <span className="shortcut-title">Update System</span>
        </button>

        <button className="shortcut-btn" onClick={handleClean} title="Clean Cache">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
          <span className="shortcut-title">Clean Cache</span>
        </button>

        <button className="shortcut-btn" onClick={handleInfo} title="System Info">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
          <span className="shortcut-title">System Info</span>
        </button>

        <button className="shortcut-btn" onClick={handleBackup} title="Smart Backup">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span className="shortcut-title">Smart Backup</span>
        </button>
      </div>
    </div>
  );
};
