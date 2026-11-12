import React from 'react';
import { BackendStatus, HealthStatus } from '../types';

interface SystemStatusCardProps {
  backendOnline: boolean | null;
  backendData: BackendStatus | null;
  healthData: HealthStatus | null;
}

export const SystemStatusCard: React.FC<SystemStatusCardProps> = ({
  backendOnline,
  backendData,
  healthData,
}) => {
  return (
    <div className="jarvis-card system-status-card">
      <div className="card-header">
        <h4 className="card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          SYSTEM TELEMETRY & HARDWARE
        </h4>
        <span className="telemetry-badge">
          {backendOnline ? 'IPC LOCALHOST:8000' : 'DISCONNECTED'}
        </span>
      </div>

      <div className="status-grid">
        {/* Host Machine */}
        <div className="status-item">
          <span className="status-label">Host System</span>
          <span className="status-val text-bright">MacBook Air</span>
          <span className="status-sub">
            {backendData?.machine ? `Apple Silicon (${backendData.machine})` : 'macOS Darwin'}
          </span>
        </div>

        {/* AI Brain / Gemini */}
        <div className="status-item">
          <span className="status-label">AI Brain Engine</span>
          <span className="status-val text-cyan">Gemini 3.5 Flash</span>
          <span className="status-sub">
            {backendOnline ? 'Connected (via .env)' : 'Offline / Standby'}
          </span>
        </div>

        {/* Local SQLite Database */}
        <div className="status-item">
          <span className="status-label">Local Memory DB</span>
          <span className="status-val text-emerald">
            {backendData?.database ? 'SQLite 3 Active' : 'jarvis.db'}
          </span>
          <span className="status-sub">
            backend/data/jarvis.db
          </span>
        </div>

        {/* Memory & Sessions Count */}
        <div className="status-item">
          <span className="status-label">Persistent Memory</span>
          <span className="status-val text-bright">
            {backendData?.memories_count ?? 0} Memories
          </span>
          <span className="status-sub">
            {backendData?.conversations_count ?? 0} Active Conversations
          </span>
        </div>

        {/* Python Backend Runtime */}
        <div className="status-item">
          <span className="status-label">Backend Core</span>
          <span className="status-val text-amber">
            FastAPI + Uvicorn
          </span>
          <span className="status-sub">
            {backendData?.python_version ? `Python v${backendData.python_version}` : 'Python 3.12'}
          </span>
        </div>

        {/* Service Uptime */}
        <div className="status-item">
          <span className="status-label">Service Health</span>
          <span className="status-val text-bright">
            {healthData?.status === 'healthy' ? 'HEALTHY' : 'STANDBY'}
          </span>
          <span className="status-sub">
            {healthData?.uptime_seconds !== undefined
              ? `Uptime: ${Math.floor(healthData.uptime_seconds)}s`
              : 'Polling...'}
          </span>
        </div>
      </div>
    </div>
  );
};
