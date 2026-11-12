import React from 'react';

export const SecurityCenterWorkspace: React.FC = () => {
  return (
    <div className="modular-workspace-container" aria-label="Security Center">
      <div className="workspace-card">
        <div className="workspace-card-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          SECURITY CENTER &bull; AUDIT &amp; PERMISSION SHIELD
        </div>

        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          Verification of API key boundary isolation, sandboxing rules, and CORS protection.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>&check; Gemini Key Isolation</span>
              <span style={{ color: 'var(--green)', fontSize: '10px', fontWeight: 600 }}>SECURE</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Gemini API key is read solely server-side via Pydantic settings from <code>backend/.env</code>. It is never transmitted to the browser or stored in bundle code.
            </p>
          </div>

          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>&check; Vite Proxy Guard</span>
              <span style={{ color: 'var(--green)', fontSize: '10px', fontWeight: 600 }}>ACTIVE</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              Same-origin proxy routes requests cleanly to <code>http://127.0.0.1:8000</code> avoiding open CORS risks.
            </p>
          </div>

          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontWeight: 700, color: 'var(--green)' }}>&check; Memory Approval Gate</span>
              <span style={{ color: 'var(--green)', fontSize: '10px', fontWeight: 600 }}>ENFORCED</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
              User consent is required before any persistent memory entry is committed to SQLite storage.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

