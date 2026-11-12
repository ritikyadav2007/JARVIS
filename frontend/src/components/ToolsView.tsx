import React, { useState } from 'react';
import { BackendStatus } from '../types';

interface ToolsViewProps {
  backendData: BackendStatus | null;
  onRunDiagnostic: () => void;
}

export const ToolsView: React.FC<ToolsViewProps> = ({
  backendData,
  onRunDiagnostic,
}) => {
  const [testResult, setTestResult] = useState<string | null>(null);
  const [testing, setTesting] = useState(false);

  const handlePingBackend = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/health');
      if (res.ok) {
        const json = await res.json();
        setTestResult(`SUCCESS: Backend responding (Status: ${json.status}, Uptime: ${json.uptime_seconds}s)`);
      } else {
        setTestResult(`ERROR: Backend returned HTTP ${res.status}`);
      }
    } catch (err: any) {
      setTestResult(`ERROR: Failed to connect to http://127.0.0.1:8000 (${err.message})`);
    } finally {
      setTesting(false);
    }
  };

  const handleTestDatabase = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/status');
      if (res.ok) {
        const json = await res.json();
        setTestResult(`SQLITE VERIFIED: DB: ${json.database}, Stored Memories: ${json.memories_count}, Conversations: ${json.conversations_count}`);
      } else {
        setTestResult(`ERROR: Failed to query status (HTTP ${res.status})`);
      }
    } catch (err: any) {
      setTestResult(`ERROR: Database check failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="jarvis-card tools-view-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            MAC OS TACTICAL TOOLS & DIAGNOSTICS
          </h3>
          <p className="card-subtitle">
            Local MacBook Air diagnostics, environment inspection, and IPC integrity verification.
            {backendData && (
              <span style={{ display: 'block', marginTop: '4px', color: '#00f0ff', fontFamily: 'monospace' }}>
                System: {backendData.platform} ({backendData.machine}) • Phase {backendData.phase} Active
              </span>
            )}
          </p>
        </div>
      </div>

      {testResult && (
        <div className={`hud-alert-banner ${testResult.startsWith('SUCCESS') || testResult.startsWith('SQLITE') ? 'hud-alert-success' : ''}`}>
          <span>{testResult}</span>
        </div>
      )}

      <div className="tools-grid">
        {/* Tool 1 */}
        <div className="tool-card">
          <div className="tool-icon text-cyan">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
          </div>
          <div className="tool-content">
            <span className="tool-title">FastAPI Backend IPC Ping</span>
            <span className="tool-desc">Verify local HTTP REST connection over port 8000</span>
          </div>
          <button
            className="hud-button-subtle"
            onClick={handlePingBackend}
            disabled={testing}
          >
            {testing ? 'Testing...' : 'Execute Ping'}
          </button>
        </div>

        {/* Tool 2 */}
        <div className="tool-card">
          <div className="tool-icon text-emerald">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
          </div>
          <div className="tool-content">
            <span className="tool-title">SQLite Integrity & Memory Scan</span>
            <span className="tool-desc">Query `backend/data/jarvis.db` record count and WAL state</span>
          </div>
          <button
            className="hud-button-subtle"
            onClick={handleTestDatabase}
            disabled={testing}
          >
            {testing ? 'Scanning...' : 'Scan SQLite'}
          </button>
        </div>

        {/* Tool 3 */}
        <div className="tool-card">
          <div className="tool-icon text-amber">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
            </svg>
          </div>
          <div className="tool-content">
            <span className="tool-title">Full System Diagnostics Instruction</span>
            <span className="tool-desc">Dispatch a full prompt to JARVIS to review Mac environment specs</span>
          </div>
          <button className="hud-button" onClick={onRunDiagnostic}>
            Run Diagnostics
          </button>
        </div>

        {/* Tool 4 - Future Mac Automation Architecture */}
        <div className="tool-card tool-disabled">
          <div className="tool-icon text-dim">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07"></line>
            </svg>
          </div>
          <div className="tool-content">
            <span className="tool-title">Native Mac Automation Bridge</span>
            <span className="tool-desc">
              AppleScript & macOS Accessibility automation (Planned for Phase 3)
            </span>
          </div>
          <span className="tool-status-pill">PHASE 3 PREPARED</span>
        </div>
      </div>
    </div>
  );
};
