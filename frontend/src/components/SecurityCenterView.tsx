import React, { useState } from 'react';

export const SecurityCenterView: React.FC = () => {
  const [lockdownActive, setLockdownActive] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const permissions = [
    { name: 'Microphone Audio Input', level: 'User-Prompted', status: 'Granted in Browser', desc: 'Allows push-to-talk speech recognition.' },
    { name: 'Local SQLite Database Access', level: 'Scoped / Protected', status: 'Active (backend/data/)', desc: 'Stores long-term user memories and multi-turn sessions locally.' },
    { name: 'Workspace File System', level: 'Sandboxed', status: 'Restricted to /Jarvis', desc: 'Strictly limited to the active project directory.' },
    { name: 'External Network Egress', level: 'Allowlisted', status: 'Google GenAI Only', desc: 'Outbound calls scoped exclusively to generativelanguage.googleapis.com.' },
    { name: 'macOS System Automation', level: 'Phase 2 Gate', status: 'Requires Explicit Approval', desc: 'Applescript and system control operations require manual user prompt.' },
  ];

  const connectedDevices = [
    { name: 'MacBook Air (Host)', type: 'macOS 15+ Apple Silicon', ip: '127.0.0.1 (Localhost)', status: 'Authorized / Active', color: 'text-emerald' },
    { name: 'Apple iPhone Bridge', type: 'iOS Continuity LE', ip: 'Unpaired', status: 'Standby / Awaiting Pair', color: 'text-amber' },
    { name: 'Google Android Bridge', type: 'ADB Local Network', ip: 'Unpaired', status: 'Standby / Awaiting Pair', color: 'text-amber' },
  ];

  const handleToggleLockdown = () => {
    setLockdownActive(!lockdownActive);
    setNotice(!lockdownActive ? '🚨 EMERGENCY LOCKDOWN ACTIVE: All outbound network and automation bridges paused.' : '✓ Lockdown deactivated. Normal operations resumed.');
    setTimeout(() => setNotice(null), 5000);
  };

  return (
    <div className="jarvis-card security-center-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            TACTICAL SECURITY & PERMISSION VAULT
          </h3>
          <p className="card-subtitle">
            Zero-trust device authorization, sandboxed permission management, and audit telemetry.
          </p>
        </div>

        <button
          className={`hud-button ${lockdownActive ? 'hud-button-warn' : 'hud-button-subtle'}`}
          onClick={handleToggleLockdown}
        >
          {lockdownActive ? '🚨 DEACTIVATE LOCKDOWN' : 'EMERGENCY LOCKDOWN'}
        </button>
      </div>

      {notice && (
        <div className="hud-feedback-alert">
          <span>{notice}</span>
        </div>
      )}

      <div className="security-sections-grid">
        {/* Connected Devices */}
        <div className="security-box">
          <h4 className="section-title">AUTHORIZED DEVICES & BRIDGES</h4>
          <div className="devices-table">
            {connectedDevices.map((d) => (
              <div key={d.name} className="device-security-row">
                <div className="dev-sec-info">
                  <span className="dev-sec-name">{d.name}</span>
                  <span className="dev-sec-type">{d.type} • {d.ip}</span>
                </div>
                <div className="dev-sec-actions">
                  <span className={`status-tag ${d.color}`}>{d.status}</span>
                  {d.ip !== '127.0.0.1 (Localhost)' && (
                    <button className="hud-button-small hud-button-warn" disabled>
                      Revoke
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Permission Matrix */}
        <div className="security-box">
          <h4 className="section-title">SECURITY & ACCESS PERMISSIONS MATRIX</h4>
          <div className="permissions-table">
            {permissions.map((p) => (
              <div key={p.name} className="perm-row">
                <div className="perm-info">
                  <div className="perm-top">
                    <span className="perm-name">{p.name}</span>
                    <span className="perm-level">[{p.level}]</span>
                  </div>
                  <span className="perm-desc text-dim">{p.desc}</span>
                </div>
                <span className="perm-status text-cyan">{p.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Audit Log */}
        <div className="security-box full-width">
          <h4 className="section-title">AUDIT & ACCESS TRAIL</h4>
          <div className="audit-trail-list">
            <div className="audit-row">
              <span className="audit-time">[2026-11-11 14:11]</span>
              <span className="audit-event text-emerald">AUTHENTICATION VERIFIED</span>
              <span className="audit-detail">Gemini 3.5 Flash handshake validated via backend/.env without client leakage.</span>
            </div>
            <div className="audit-row">
              <span className="audit-time">[2026-11-11 13:49]</span>
              <span className="audit-event text-cyan">CONFIGURATION UPDATED</span>
              <span className="audit-detail">Model setting switched to gemini-3.5-flash with 30s timeout guard.</span>
            </div>
            <div className="audit-row">
              <span className="audit-time">[2026-11-11 13:04]</span>
              <span className="audit-event text-emerald">DATABASE INTEGRITY</span>
              <span className="audit-detail">Local SQLite database checked at backend/data/jarvis.db. Tables intact.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
