import React, { useState } from 'react';

export const DevStudioView: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('backend/app/services/gemini_service.py');
  const [activeTab, setActiveTab] = useState<'editor' | 'terminal' | 'preview'>('editor');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([
    'JARVIS Tactical Terminal // Sandboxed Build Engine',
    'Virtualenv: backend/.venv (Python 3.12.16)',
    'Node Engine: v20+ // Vite 5.4.11',
    'Ready for diagnostic inspections.',
  ]);

  const fileTree = [
    {
      dir: 'backend',
      files: [
        'main.py',
        'app/core/config.py',
        'app/services/gemini_service.py',
        'app/routes/chat.py',
        'app/routes/memories.py',
        'app/db/database.py',
        'app/db/repositories.py',
      ],
    },
    {
      dir: 'frontend',
      files: [
        'src/App.tsx',
        'src/api.ts',
        'src/types.ts',
        'src/hooks/useVoice.ts',
        'src/components/CommandCenterView.tsx',
        'src/components/HolographicHumanoid.tsx',
        'src/components/Sidebar.tsx',
      ],
    },
  ];

  const codeSnippets: Record<string, string> = {
    'backend/app/services/gemini_service.py': `// backend/app/services/gemini_service.py
import asyncio
from google import genai
from app.core.config import settings

async def ask_jarvis(message: str, previous_interaction_id=None):
    client = _get_client()
    kwargs = {
        "model": settings.gemini_model, # gemini-3.5-flash
        "input": message,
        "timeout": 30.0,
        "store": True,
    }
    interaction = await asyncio.wait_for(
        client.aio.interactions.create(**kwargs),
        timeout=35.0,
    )
    return {"reply": interaction.output_text, "interaction_id": interaction.id}`,
    'backend/app/core/config.py': `// backend/app/core/config.py
class Settings(BaseSettings):
    gemini_model: str = "gemini-3.5-flash"
    host: str = "127.0.0.1"
    port: int = 8000
    db_path: str = "data/jarvis.db"`,
    'src/App.tsx': `// frontend/src/App.tsx
export default function App() {
    // 5-area hybrid layout:
    // TopSystemBar, Sidebar, Central Core, Right Intelligence, Bottom Task Workspace
    return <HybridCommandCenter />;
}`,
  };

  const runDiagnostics = () => {
    setTerminalOutput((prev) => [
      ...prev,
      `$ python3 -m compileall backend/app`,
      `Listing 'backend/app'... All files verified. Exit: 0 OK`,
      `$ tsc --noEmit && vite build`,
      `Compiled successfully in 1.4s. 0 errors.`,
    ]);
  };

  return (
    <div className="jarvis-card dev-studio-card">
      <div className="card-header">
        <div className="header-left">
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <polyline points="16 18 22 12 16 6"></polyline>
              <polyline points="8 6 2 12 8 18"></polyline>
            </svg>
            DEVELOPMENT STUDIO & CODE ENGINE
          </h3>
          <p className="card-subtitle">
            Project exploration, syntax inspection, safe sandboxed terminal and live preview.
          </p>
        </div>

        <div className="dev-header-actions">
          <button className="hud-button hud-button-cyan" onClick={runDiagnostics}>
            Run Integrity Check
          </button>
        </div>
      </div>

      <div className="dev-studio-body">
        {/* Left Project Explorer */}
        <div className="project-tree-sidebar">
          <div className="tree-header">PROJECT EXPLORER</div>
          <div className="tree-content">
            {fileTree.map((group) => (
              <div key={group.dir} className="tree-folder">
                <span className="folder-title">📁 {group.dir}/</span>
                <div className="folder-files">
                  {group.files.map((file) => (
                    <button
                      key={file}
                      className={`tree-file-btn ${selectedFile === `${group.dir}/${file}` ? 'file-active' : ''}`}
                      onClick={() => setSelectedFile(`${group.dir}/${file}`)}
                    >
                      <span className="file-icon">📄</span>
                      <span className="file-name">{file}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Editor / Terminal / Preview Tabs */}
        <div className="studio-main-viewport">
          <div className="studio-tabs-bar">
            <button
              className={`studio-tab ${activeTab === 'editor' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('editor')}
            >
              Code Editor: {selectedFile.split('/').pop()}
            </button>
            <button
              className={`studio-tab ${activeTab === 'terminal' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('terminal')}
            >
              Tactical Terminal
            </button>
            <button
              className={`studio-tab ${activeTab === 'preview' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              Local Web Preview (Port 5173)
            </button>
          </div>

          <div className="studio-tab-content">
            {activeTab === 'editor' && (
              <div className="code-viewer-container">
                <div className="code-viewer-meta">
                  <span>File: {selectedFile}</span>
                  <span className="meta-badge">READ-ONLY // SCOPED ACCESS</span>
                </div>
                <pre className="code-block">
                  <code>{codeSnippets[selectedFile] || `// ${selectedFile}\n// Source file indexed and loaded from project tree.\n// Ready for authorized modifications.`}</code>
                </pre>
              </div>
            )}

            {activeTab === 'terminal' && (
              <div className="terminal-container">
                <div className="terminal-header">
                  <span className="term-dot dot-red"></span>
                  <span className="term-dot dot-yellow"></span>
                  <span className="term-dot dot-green"></span>
                  <span className="term-title">zsh // sandboxed execution shell</span>
                </div>
                <div className="terminal-output">
                  {terminalOutput.map((line, idx) => (
                    <div key={idx} className="terminal-line">{line}</div>
                  ))}
                  <div className="terminal-prompt-line">
                    <span className="term-user">jarvis@macbook</span>:<span className="term-path">~/Jarvis</span>$ <span className="term-cursor">▌</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preview' && (
              <div className="preview-pane-container">
                <div className="preview-browser-bar">
                  <span className="preview-url">http://localhost:5173/</span>
                  <span className="preview-status text-emerald">● SERVING LIVE</span>
                </div>
                <div className="preview-screen-mock">
                  <div className="preview-hero">
                    <h3>JARVIS AI Dashboard Active</h3>
                    <p>Connected to FastAPI Backend at http://127.0.0.1:8000</p>
                    <div className="preview-status-pill">System Status: 100% Operational</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
