import React from 'react';

export const PhoneHubWorkspace: React.FC = () => {
  return (
    <div className="modular-workspace-container" aria-label="Phone Hub">
      <div className="workspace-card">
        <div className="workspace-card-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
          PHONE HUB &bull; MOBILE DEVICE BRIDGE
        </div>

        <div style={{ padding: '12px 14px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--red)', borderRadius: '6px', color: '#fca5a5', fontSize: '12.5px', marginBottom: '16px' }}>
          <strong>STATUS: NOT CONNECTED</strong> &bull; No active iPhone or Android device bridge is paired. Mobile SMS, notifications, and telemetry forwarding require companion mobile client setup.
        </div>

        <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px', maxWidth: '480px' }}>
          <h4 style={{ color: 'var(--cyan)', fontSize: '13px', marginBottom: '8px' }}>Companion Mobile Client Specification</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: 1.4, marginBottom: '10px' }}>
            When a mobile client is paired via authenticated WebSocket or Local Area Network, incoming calls, notifications, and device telemetry will stream here in real time.
          </p>
          <button className="chat-send-btn" style={{ width: 'auto', padding: '0 16px', fontSize: '11px' }} disabled>
            Awaiting Mobile Pair Request
          </button>
        </div>
      </div>
    </div>
  );
};

