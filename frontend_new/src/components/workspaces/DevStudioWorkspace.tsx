import React, { useState } from 'react';

export const DevStudioWorkspace: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState('backend/app/services/gemini_service.py');

  const files = [
    'backend/main.py',
    'backend/app/core/config.py',
    'backend/app/services/gemini_service.py',
    'backend/app/routes/chat.py',
    'backend/app/routes/memories.py',
    'backend/app/db/repositories.py',
  ];

  return (
    <div className="modular-workspace-container" aria-label="Development Studio">
      <div className="workspace-card">
        <div className="workspace-card-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
          </svg>
          DEV STUDIO &bull; LOCAL CODE INSPECTOR
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '14px' }}>
          Inspect and review repository architecture, verified backend services, and TypeScript contracts.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '14px', minHeight: '340px' }}>
          {/* File Explorer */}
          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '10px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--cyan)', letterSpacing: '1px', marginBottom: '8px' }}>
              SOURCE FILES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {files.map((f) => (
                <button
                  key={f}
                  onClick={() => setSelectedFile(f)}
                  style={{
                    textAlign: 'left',
                    padding: '6px 8px',
                    borderRadius: '4px',
                    border: '1px solid',
                    borderColor: selectedFile === f ? 'var(--cyan)' : 'transparent',
                    background: selectedFile === f ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                    color: selectedFile === f ? '#ffffff' : 'var(--text-secondary)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {f.split('/').pop()}
                </button>
              ))}
            </div>
          </div>

          {/* Code Viewer */}
          <div style={{ background: 'rgba(1, 4, 10, 0.85)', border: '1px solid var(--border)', borderRadius: '6px', padding: '12px', fontFamily: 'var(--font-mono)', fontSize: '11px', overflow: 'auto' }}>
            <div style={{ color: 'var(--cyan-light)', marginBottom: '8px', borderBottom: '1px solid rgba(0, 240, 255, 0.2)', paddingBottom: '4px' }}>
              {selectedFile}
            </div>
            <pre style={{ margin: 0, color: '#e2e8f0', lineHeight: 1.5 }}>
{selectedFile.includes('gemini_service')
  ? `async def ask_jarvis(
    message: str,
    previous_interaction_id: Optional[str] = None,
    conversation_id: Optional[str] = None,
) -> dict:
    client = _get_client()
    kwargs = {
        "model": settings.gemini_model, # gemini-3.5-flash
        "input": message,
        "system_instruction": system_instruction,
        "store": True,
        "timeout": 30.0,
    }
    interaction = await client.aio.interactions.create(**kwargs)
    return {
        "reply": interaction.output_text,
        "interaction_id": interaction.id,
    }`
  : `# ${selectedFile}
# Active sandboxed inspection mode.
# All APIs running under FastAPI on 127.0.0.1:8000.`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

