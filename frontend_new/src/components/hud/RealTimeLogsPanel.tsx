import React from 'react';
import type { LogEntry } from '../../types';

interface RealTimeLogsPanelProps {
  logs: LogEntry[];
}

export const RealTimeLogsPanel: React.FC<RealTimeLogsPanelProps> = ({ logs }) => {
  return (
    <div className="hud-panel panel-logs" aria-label="Real-Time System Logs">
      <div className="hud-panel-header">
        <span className="hud-panel-title">REAL-TIME LOGS</span>
        <div className="hud-panel-controls">
          <span className="panel-btn" style={{ fontSize: '9px', color: 'var(--cyan)' }}>View All &rarr;</span>
          <span className="panel-btn" title="Minimize">&mdash;</span>
          <span className="panel-btn" title="Maximize">&#9633;</span>
          <span className="panel-btn" title="Close">&times;</span>
        </div>
      </div>

      <div className="logs-list-scroll">
        {logs.slice(-6).map((log) => (
          <div key={log.id} className="log-entry-row">
            <span className="log-time">{log.time}</span>
            <span className={`log-tag tag-${log.type}`}>
              [{log.type.toUpperCase()}]
            </span>
            <span className="log-desc">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
