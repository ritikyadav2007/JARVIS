import React from 'react';

export const AutomationCenterWorkspace: React.FC = () => {
  return (
    <div className="modular-workspace-container" aria-label="Automation Center">
      <div className="workspace-card">
        <div className="workspace-card-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
          </svg>
          AUTOMATION CENTER &bull; DIRECTIVE PIPELINE
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          Configured neural automations, recurring telemetry polling routines, and scheduled background tasks.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>Hardware Telemetry Polling</span>
              <span style={{ color: 'var(--green)', fontSize: '10px', fontWeight: 600 }}>RUNNING</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Periodically queries <code>/api/system/metrics</code> for CPU, memory, disk, and process loads.
            </p>
          </div>

          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>Local SQLite Sync</span>
              <span style={{ color: 'var(--green)', fontSize: '10px', fontWeight: 600 }}>STANDBY</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Multi-turn message persistence and approved user preference indexing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

