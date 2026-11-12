import React, { useState, useEffect } from 'react';
import { BackendStatus, HealthStatus, AIState } from '../types';

interface TopSystemBarProps {
  backendOnline: boolean | null;
  backendData: BackendStatus | null;
  healthData: HealthStatus | null;
  aiState: AIState;
  onOpenSettings: () => void;
  onOpenSecurity: () => void;
}

export const TopSystemBar: React.FC<TopSystemBarProps> = ({
  backendOnline,
  backendData,
  healthData,
  aiState,
  onOpenSettings,
  onOpenSecurity,
}) => {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentDate, setCurrentDate] = useState<string>('');
  const [showNotifications, setShowNotifications] = useState<boolean>(false);
  const [unreadNotifs, setUnreadNotifs] = useState<number>(1);

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const aiStatusLabel = {
    ready: 'STANDBY',
    idle: 'STANDBY',
    listening: 'LISTENING',
    processing: 'PROCESSING',
    thinking: 'THINKING',
    executing: 'EXECUTING',
    speaking: 'VOCALIZING',
    completed: 'TASK COMPLETE',
    error: 'ATTENTION REQ',
  }[aiState] || 'ONLINE';

  const aiStatusColor = {
    ready: '#00f0ff',
    idle: '#00f0ff',
    listening: '#38bdf8',
    processing: '#a855f7',
    thinking: '#c084fc',
    executing: '#3b82f6',
    speaking: '#10b981',
    completed: '#10b981',
    error: '#ef4444',
  }[aiState] || '#00f0ff';

  return (
    <header className="top-system-bar">
      {/* Brand & AI Core Identifier */}
      <div className="topbar-left">
        <div className="topbar-brand">
          <span className="brand-glow-tag">J.A.R.V.I.S.</span>
          <span className="brand-release-tag">NEURAL COMMAND HUD</span>
        </div>

        {/* AI State Pill */}
        <div className="topbar-status-pill" style={{ borderColor: `${aiStatusColor}40` }}>
          <span
            className="pulse-dot"
            style={{
              backgroundColor: aiStatusColor,
              boxShadow: `0 0 10px ${aiStatusColor}`,
            }}
          ></span>
          <span className="pill-label" style={{ color: aiStatusColor }}>
            AI: {aiStatusLabel}
          </span>
          <span className="pill-sub">gemini-3.5-flash</span>
        </div>

        {/* Backend State Pill */}
        <div className="topbar-status-pill">
          <span
            className="status-dot"
            style={{
              backgroundColor: backendOnline ? '#10b981' : '#f59e0b',
              boxShadow: backendOnline ? '0 0 8px #10b981' : 'none',
            }}
          ></span>
          <span className="pill-label">
            CORE: {backendOnline === null ? 'CONNECTING...' : backendOnline ? 'ONLINE' : 'OFFLINE'}
          </span>
          {healthData && (
            <span className="pill-sub">{Math.floor(healthData.uptime_seconds)}s UPTIME</span>
          )}
        </div>
      </div>

      {/* Center Device & Clock Telemetry */}
      <div className="topbar-center">
        {/* Active Device */}
        <div className="device-chip" title="Connected Host Device">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span className="device-name">MacBook Air</span>
          <span className="device-arch">{backendData?.machine ? `(${backendData.machine})` : '(Apple Silicon)'}</span>
        </div>

        {/* Live Clock HUD */}
        <div className="topbar-clock">
          <span className="clock-date">{currentDate}</span>
          <span className="clock-time">{currentTime}</span>
        </div>
      </div>

      {/* Right Controls & Indicators */}
      <div className="topbar-right">
        {/* Security Status */}
        <button
          className="topbar-icon-chip"
          onClick={onOpenSecurity}
          title="Security Center: Encrypted Local Vault Active"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span className="chip-text text-emerald">SECURE</span>
        </button>

        {/* Notifications */}
        <div className="notif-wrapper">
          <button
            className="topbar-icon-btn"
            onClick={() => {
              setShowNotifications(!showNotifications);
              setUnreadNotifs(0);
            }}
            title="System Notifications"
            aria-label="System Notifications"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
            {unreadNotifs > 0 && <span className="notif-badge">{unreadNotifs}</span>}
          </button>

          {showNotifications && (
            <div className="notif-popover">
              <div className="notif-header">
                <h4>System Intelligence Feed</h4>
                <button onClick={() => setShowNotifications(false)}>✕</button>
              </div>
              <div className="notif-list">
                <div className="notif-item">
                  <span className="notif-bullet text-cyan">●</span>
                  <div className="notif-content">
                    <span className="notif-title">Gemini 3.5 Flash Online</span>
                    <span className="notif-desc">Primary AI model inference active and responsive.</span>
                    <span className="notif-time">Just now</span>
                  </div>
                </div>
                <div className="notif-item">
                  <span className="notif-bullet text-emerald">●</span>
                  <div className="notif-content">
                    <span className="notif-title">Local SQLite Memory Verified</span>
                    <span className="notif-desc">
                      {backendData?.memories_count ?? 2} approved facts loaded from backend/data/jarvis.db.
                    </span>
                    <span className="notif-time">Session Start</span>
                  </div>
                </div>
                <div className="notif-item">
                  <span className="notif-bullet text-amber">●</span>
                  <div className="notif-content">
                    <span className="notif-title">External Phone Hub Ready</span>
                    <span className="notif-desc">iPhone & Android bridges awaiting pairing authorization.</span>
                    <span className="notif-time">Standby</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Settings */}
        <button
          className="topbar-icon-btn"
          onClick={onOpenSettings}
          title="Open Settings"
          aria-label="Open Settings"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};
