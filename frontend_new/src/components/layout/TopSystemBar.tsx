import React, { useState, useEffect } from 'react';
import type { BackendStatus, HealthStatus, AIState } from '../../types';

interface TopSystemBarProps {
  backendOnline: boolean | null;
  backendData: BackendStatus | null;
  healthData: HealthStatus | null;
  aiState: AIState;
  onOpenSettings: () => void;
}

export const TopSystemBar: React.FC<TopSystemBarProps> = ({
  backendOnline,
  healthData,
  onOpenSettings,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>('');
  const [unreadCount] = useState<number>(3);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })
      );
      setDateStr(
        now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds?: number): string => {
    if (!seconds && seconds !== 0) return '02:14:37';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="top-system-bar" role="banner">
      <div className="topbar-left">
        <div className="arc-reactor-logo" title="JARVIS Arc Reactor Core">
          <svg width="24" height="24" viewBox="0 0 40 40" className="arc-reactor-svg">
            <circle cx="20" cy="20" r="17" stroke="#00f0ff" strokeWidth="1.5" strokeDasharray="6 3" fill="none" opacity="0.6" />
            <circle cx="20" cy="20" r="12" stroke="#38bdf8" strokeWidth="2" strokeDasharray="14 4" fill="none" />
            <polygon points="20 10 28 25 12 25" stroke="#00f0ff" strokeWidth="1.5" fill="rgba(0, 240, 255, 0.25)" />
            <circle cx="20" cy="20" r="4" fill="#ffffff" />
          </svg>
        </div>

        <div className="topbar-title-block">
          <span className="topbar-main-title">JARVIS</span>
          <span className="topbar-sub-title">NEURAL COMMAND HUD &gt;&gt;</span>
        </div>
      </div>

      <div className="topbar-middle">
        <div className="digital-clock-box">
          <span className="clock-digits">{timeStr || '21:42:17'}</span>
          <span className="clock-date">{dateStr || 'Mon, Apr 28, 2025'}</span>
        </div>

        <div className="gemini-status-pill">
          <span
            className={`status-dot ${backendOnline === true ? 'dot-green' : backendOnline === false ? 'dot-red' : 'dot-amber'}`}
          />
          <div className="gemini-pill-content">
            <div className="gemini-pill-row1">
              <span>Gemini</span> &bull; <span className="model-name">gemini-3.5-flash</span>
            </div>
            <div className="gemini-pill-row2">
              <span className="core-online">CORE: {backendOnline === true ? 'ONLINE' : backendOnline === false ? 'OFFLINE' : 'CONNECTING...'}</span>
              <span> &bull; Uptime: {formatUptime(healthData?.uptime_seconds)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="topbar-right">
        <button className="notif-badge-btn" title="System Notifications" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <span className="notif-count">{unreadCount}</span>
        </button>

        <button
          className="topbar-icon-btn"
          onClick={onOpenSettings}
          title="Command Settings"
          aria-label="Settings"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>

        <div className="topbar-win-controls">
          <button className="win-ctl-btn" title="Minimize Window" aria-label="Minimize">&mdash;</button>
          <button className="win-ctl-btn" title="Maximize Window" aria-label="Maximize">&#9633;</button>
          <button className="win-ctl-btn win-ctl-close" title="Close Window" aria-label="Close">&times;</button>
        </div>
      </div>
    </header>
  );
};
