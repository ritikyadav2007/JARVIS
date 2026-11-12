import React from 'react';

export const ProjectManagerWorkspace: React.FC = () => {
  return (
    <div className="modular-workspace-container" aria-label="Project Manager">
      <div className="workspace-card">
        <div className="workspace-card-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
          PROJECT MANAGER &bull; WORKSPACE DIRECTORY
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '16px' }}>
          Overview of registered local development projects and active workspace status.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontWeight: 700, color: 'var(--cyan)' }}>JARVIS AI Core</span>
              <span style={{ fontSize: '10px', color: 'var(--green)', fontWeight: 600 }}>ACTIVE</span>
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '10px' }}>
              FastAPI + Gemini 3.5 Flash Assistant with local SQLite memory persistence.
            </p>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: '#94a3b8' }}>
              Path: /Users/ritikdagar/Projects/Jarvis
            </div>
          </div>

          <div style={{ background: 'rgba(3, 17, 35, 0.5)', border: '1px dashed var(--border)', borderRadius: '6px', padding: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>+ Register New Local Workspace</span>
          </div>
        </div>
      </div>
    </div>
  );
};

