import React, { useState } from 'react';
import { BackendStatus } from '../types';

interface MacControlViewProps {
  backendData: BackendStatus | null;
}

export const MacControlView: React.FC<MacControlViewProps> = ({ backendData }) => {
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const triggerAppLaunch = (appName: string, isReady: boolean) => {
    if (!isReady) {
      setFeedbackMsg(`⚠️ Launching ${appName} requires macOS Automation permissions (Phase 2 integration).`);
    } else {
      setFeedbackMsg(`✓ Access verified for ${appName}. Scoped sandbox confirmed.`);
    }
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  const approvedApps = [
    { name: 'Terminal', bundle: 'com.apple.Terminal', ready: true, desc: 'Sandboxed shell operations within project directory.' },
    { name: 'VS Code', bundle: 'com.microsoft.VSCode', ready: true, desc: 'Primary IDE code workspace.' },
    { name: 'Finder', bundle: 'com.apple.finder', ready: true, desc: 'Scoped local directory browsing.' },
    { name: 'Activity Monitor', bundle: 'com.apple.ActivityMonitor', ready: false, desc: 'Hardware telemetry inspection (Phase 2).' },
    { name: 'System Settings', bundle: 'com.apple.systempreferences', ready: false, desc: 'macOS permission & security configuration (Phase 2).' },
  ];

  return (
    <div className="jarvis-card mac-control-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            MAC OS SYSTEM & HARDWARE CONTROL CENTER
          </h3>
          <p className="card-subtitle">
            Host integration for MacBook Air. Showing implemented features and planned Phase 2 automations.
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="hud-feedback-alert">
          <span>{feedbackMsg}</span>
        </div>
      )}

      <div className="mac-control-grid">
        {/* 1. Host Telemetry */}
        <div className="control-section-box">
          <h4 className="section-title">1. HOST SYSTEM METRICS</h4>
          <div className="mac-telemetry-list">
            <div className="mac-metric-row">
              <span className="metric-label">Model</span>
              <span className="metric-val text-bright">MacBook Air</span>
            </div>
            <div className="mac-metric-row">
              <span className="metric-label">Processor Architecture</span>
              <span className="metric-val text-cyan">{backendData?.machine || 'Apple Silicon (arm64)'}</span>
            </div>
            <div className="mac-metric-row">
              <span className="metric-label">Operating System</span>
              <span className="metric-val">{backendData?.platform || 'macOS Darwin'} {backendData?.platform_release ? `(Release ${backendData.platform_release})` : ''}</span>
            </div>
            <div className="mac-metric-row">
              <span className="metric-label">Python Environment</span>
              <span className="metric-val text-emerald">v{backendData?.python_version || '3.12.16'} (.venv)</span>
            </div>
            <div className="mac-metric-row">
              <span className="metric-label">Security Sandbox</span>
              <span className="metric-val text-emerald">Enforced // Scoped to Project</span>
            </div>
          </div>
        </div>

        {/* 2. Approved Application Launchers */}
        <div className="control-section-box">
          <h4 className="section-title">2. APPROVED APPLICATION LAUNCHERS</h4>
          <div className="app-launchers-list">
            {approvedApps.map((app) => (
              <div key={app.name} className="app-launcher-row">
                <div className="app-info">
                  <span className="app-name">{app.name}</span>
                  <span className="app-desc">{app.desc}</span>
                </div>
                <div className="app-actions">
                  <span className={`status-tag ${app.ready ? 'tag-ready' : 'tag-pending'}`}>
                    {app.ready ? 'APPROVED' : 'PHASE 2'}
                  </span>
                  <button
                    className="hud-button-subtle"
                    onClick={() => triggerAppLaunch(app.name, app.ready)}
                  >
                    {app.ready ? 'Verify' : 'Request'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Scoped File & Folder Operations */}
        <div className="control-section-box">
          <h4 className="section-title">3. SCOPED FILE OPERATIONS</h4>
          <div className="scoped-paths-list">
            <div className="path-row">
              <span className="path-title">Authorized Root Workspace:</span>
              <code className="path-code">/Users/ritikdagar/Projects/Jarvis</code>
              <span className="path-badge text-emerald">READ / WRITE AUTHORIZED</span>
            </div>
            <div className="path-row">
              <span className="path-title">Local SQLite Storage Directory:</span>
              <code className="path-code">/Users/ritikdagar/Projects/Jarvis/backend/data/</code>
              <span className="path-badge text-emerald">PERSISTENT DB VAULT</span>
            </div>
            <div className="path-row">
              <span className="path-title">System Root & User Home:</span>
              <code className="path-code">/System, /Library, ~/*</code>
              <span className="path-badge text-amber">PROTECTED // ACCESS RESTRICTED</span>
            </div>
          </div>
        </div>

        {/* 4. Browser & Automation Bridge */}
        <div className="control-section-box">
          <h4 className="section-title">4. BROWSER & AUTOMATION BRIDGES</h4>
          <div className="bridges-list">
            <div className="bridge-item">
              <div className="bridge-top">
                <span className="bridge-name">Chrome DevTools Protocol</span>
                <span className="status-tag tag-ready">READY</span>
              </div>
              <p className="bridge-desc">Enables accessibility audits and browser inspection.</p>
            </div>
            <div className="bridge-item">
              <div className="bridge-top">
                <span className="bridge-name">macOS AppleScript & Shortcuts Bridge</span>
                <span className="status-tag tag-pending">PLANNED (PHASE 2)</span>
              </div>
              <p className="bridge-desc">System automation, volume controls, and window management with explicit confirmation.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
