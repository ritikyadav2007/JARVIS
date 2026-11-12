import React from 'react';

export const ProjectManagerView: React.FC = () => {
  const projects = [
    {
      id: 'core-assistant',
      name: 'JARVIS Core Assistant',
      status: 'Active',
      progress: 95,
      description: 'FastAPI backend, Gemini 3.5 Flash Interactions API, and multi-turn conversational continuity.',
      category: 'Backend',
      updated: '10 mins ago',
    },
    {
      id: 'local-memory',
      name: 'Local SQLite Memory Vault',
      status: 'Active',
      progress: 90,
      description: 'Persistent local database at backend/data/jarvis.db with categorization, search and user approval.',
      category: 'Database',
      updated: '25 mins ago',
    },
    {
      id: 'hybrid-command',
      name: 'Advanced Hybrid Command Center',
      status: 'In Progress',
      progress: 75,
      description: 'Desktop-first 5-area hybrid dashboard layout, holographic avatar, and workspace routing.',
      category: 'Frontend',
      updated: 'Just now',
    },
    {
      id: 'mac-automation',
      name: 'macOS Hardware & System Control',
      status: 'Planned',
      progress: 30,
      description: 'AppleScript bridges, application launching, volume/brightness telemetry, and system automation.',
      category: 'System Integration',
      updated: 'Phase 2',
    },
    {
      id: 'phone-hub',
      name: 'Cross-Device Phone Hub',
      status: 'Architecture Ready',
      progress: 40,
      description: 'Multi-platform pairing and sync architecture for iPhone and Android devices.',
      category: 'Mobile Bridges',
      updated: 'Phase 2',
    },
  ];

  const recentFiles = [
    { name: 'gemini_service.py', path: 'backend/app/services/', time: 'Updated with gemini-3.5-flash & timeouts' },
    { name: 'config.py', path: 'backend/app/core/', time: 'Host, port, and model configuration' },
    { name: 'useVoice.ts', path: 'frontend/src/hooks/', time: 'Web Speech API with interim transcript' },
    { name: 'jarvis.db', path: 'backend/data/', time: 'SQLite persistent local memory database' },
    { name: 'App.tsx', path: 'frontend/src/', time: 'Hybrid Command Center entrypoint' },
  ];

  return (
    <div className="jarvis-card project-manager-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
            STRATEGIC PROJECT MANAGER
          </h3>
          <p className="card-subtitle">
            Lifecycle monitoring, milestone tracking, and task allocation across JARVIS subsystems.
          </p>
        </div>
      </div>

      <div className="project-manager-grid">
        {/* Left: Project Cards */}
        <div className="projects-column">
          <h4 className="section-title">ACTIVE INITIATIVES</h4>
          <div className="project-cards-list">
            {projects.map((proj) => (
              <div key={proj.id} className="project-item-card">
                <div className="proj-card-top">
                  <div>
                    <span className="proj-name">{proj.name}</span>
                    <span className="proj-category">{proj.category}</span>
                  </div>
                  <span className={`proj-status-badge ${proj.status.toLowerCase().replace(' ', '-')}`}>
                    {proj.status}
                  </span>
                </div>

                <p className="proj-desc">{proj.description}</p>

                {/* Progress bar */}
                <div className="proj-progress-wrapper">
                  <div className="progress-labels">
                    <span>Progress</span>
                    <span className="text-cyan">{proj.progress}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${proj.progress}%` }}></div>
                  </div>
                </div>

                <div className="proj-card-footer">
                  <span className="proj-updated text-dim">Updated: {proj.updated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Files & Tasks */}
        <div className="project-side-column">
          <div className="side-box">
            <h4 className="section-title">RECENT PROJECT ARTIFACTS</h4>
            <div className="recent-files-list">
              {recentFiles.map((f) => (
                <div key={f.name} className="recent-file-item">
                  <span className="rf-icon">📄</span>
                  <div className="rf-info">
                    <span className="rf-name">{f.name}</span>
                    <span className="rf-path">{f.path}</span>
                    <span className="rf-note">{f.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="side-box">
            <h4 className="section-title">KEY MILESTONES</h4>
            <div className="milestones-list">
              <div className="milestone-item completed">
                <span className="m-icon">✓</span>
                <span className="m-text">Local SQLite memory database</span>
              </div>
              <div className="milestone-item completed">
                <span className="m-icon">✓</span>
                <span className="m-text">Gemini 3.5 Flash chat & continuity</span>
              </div>
              <div className="milestone-item completed">
                <span className="m-icon">✓</span>
                <span className="m-text">Phase 1 Hybrid Command Center Layout</span>
              </div>
              <div className="milestone-item pending">
                <span className="m-icon">⏳</span>
                <span className="m-text">Phase 2: macOS Application Bridge</span>
              </div>
              <div className="milestone-item pending">
                <span className="m-icon">⏳</span>
                <span className="m-text">Phase 2: Cross-Device Phone Pairing</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
