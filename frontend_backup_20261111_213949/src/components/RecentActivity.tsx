import React from 'react';
import { ActivityItem } from '../types';

interface RecentActivityProps {
  activities: ActivityItem[];
  onSelectActivity?: (item: ActivityItem) => void;
}

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities,
  onSelectActivity,
}) => {
  return (
    <div className="jarvis-card recent-activity-card">
      <div className="card-header">
        <h4 className="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
          PERSISTENT ACTIVITY STREAM
        </h4>
        <span className="telemetry-badge">SQLITE LOGS</span>
      </div>

      <div className="activity-list">
        {activities.length === 0 ? (
          <div className="empty-activity">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p>No recent database events recorded.</p>
            <span>Start a conversation or add a memory to populate the local activity ledger.</span>
          </div>
        ) : (
          activities.map((item) => (
            <div
              key={item.id}
              className="activity-item"
              onClick={() => onSelectActivity?.(item)}
            >
              <div className="activity-indicator">
                <span className={`activity-dot dot-${item.type}`}></span>
                <span className="activity-type-tag">[{item.type.toUpperCase()}]</span>
              </div>
              <div className="activity-content">
                <span className="activity-title">{item.title}</span>
                {item.detail && <span className="activity-detail">{item.detail}</span>}
              </div>
              <span className="activity-time">{item.time}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
