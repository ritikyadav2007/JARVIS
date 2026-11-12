import React from 'react';
import type { BackendStatus } from '../../types';

interface MacControlWorkspaceProps {
  backendData: BackendStatus | null;
}

export const MacControlWorkspace: React.FC<MacControlWorkspaceProps> = ({ backendData }) => {
  return (
    <div className="modular-workspace-container" aria-label="Mac Control">
      <div className="workspace-card">
        <div className="workspace-card-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          MAC CONTROL &bull; PLATFORM AUTOMATION
        </div>

        <div style={{ padding: '10px 14px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid #f59e0b', borderRadius: '6px', color: '#fcd34d', fontSize: '12.5px', marginBottom: '16px' }}>
          <strong>INTEGRATION STATUS:</strong> AppleScript and OS-level system automation bridges are currently <em>NOT CONNECTED</em> in the core backend. Direct shell command execution is disabled for safety.
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
            <div style={{ color: 'var(--cyan)', fontWeight: 700, marginBottom: '6px' }}>Host Platform Info</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div>OS: {backendData?.platform || 'macOS'} ({backendData?.platform_release || '23.4.0'})</div>
              <div>Architecture: {backendData?.machine || 'arm64'}</div>
              <div>Automation: Sandbox Mode (Strict Allowlist)</div>
            </div>
          </div>

          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
            <div style={{ color: 'var(--cyan-light)', fontWeight: 700, marginBottom: '6px' }}>Safe Queries Supported</div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Client allowlist permits local time, date, hardware metrics observation, and memory inspection without privileged escalation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
