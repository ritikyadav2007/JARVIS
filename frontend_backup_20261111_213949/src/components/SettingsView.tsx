import React from 'react';
import { BackendStatus, HealthStatus, ActiveView } from '../types';

interface SettingsViewProps {
  backendData: BackendStatus | null;
  healthData: HealthStatus | null;
  backendOnline: boolean | null;
  onSelectView: (view: ActiveView) => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onSelectVoice: (voice: SpeechSynthesisVoice) => void;
  speechRate: number;
  onRateChange: (rate: number) => void;
  speechPitch: number;
  onPitchChange: (pitch: number) => void;
  voiceSupported: boolean;
  speechSupported: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  backendData,
  healthData,
  backendOnline,
  onSelectView,
  availableVoices,
  selectedVoice,
  onSelectVoice,
  speechRate,
  onRateChange,
  speechPitch,
  onPitchChange,
  voiceSupported,
  speechSupported,
}) => {
  return (
    <div className="jarvis-card settings-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            SYSTEM CONFIGURATION & ARCHITECTURE
          </h3>
          <p className="card-subtitle">
            Core operating parameters, AI engine telemetry, and local security guarantees.
          </p>
        </div>
        <span className={`status-pill ${backendOnline ? 'status-pill-online' : 'status-pill-offline'}`}>
          {backendOnline ? 'SYSTEM NOMINAL' : 'OFFLINE'}
        </span>
      </div>

      <div className="settings-sections-grid">
        {/* Section 1: AI Engine Configuration */}
        <div className="settings-section">
          <div className="settings-section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <h4>AI Cognitive Engine</h4>
          </div>
          <div className="settings-grid">
            <div className="setting-row">
              <span className="setting-label">Foundation Model</span>
              <span className="setting-val text-cyan">Gemini 3.5 Flash</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">SDK Protocol</span>
              <span className="setting-val">google-genai 3.0.0 (aio.interactions)</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">API Key Credential</span>
              <span className="setting-val text-green">Secured in backend/.env (Hidden)</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Turn Persistence</span>
              <span className="setting-val">previous_interaction_id & conversation_id</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Persona Directive</span>
              <span className="setting-val">Iron Man Tactical Assistant (Tone: Crisp, Direct)</span>
            </div>
          </div>
        </div>

        {/* Section 2: Local SQLite Memory */}
        <div className="settings-section">
          <div className="settings-section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
              <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
              <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
            </svg>
            <h4>Local SQLite Storage</h4>
          </div>
          <div className="settings-grid">
            <div className="setting-row">
              <span className="setting-label">Database File</span>
              <span className="setting-val text-cyan">backend/data/jarvis.db</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Journal Mode</span>
              <span className="setting-val">WAL (Write-Ahead Logging)</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Active Memories</span>
              <span className="setting-val text-bright">{backendData?.memories_count ?? 0} records</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Active Conversations</span>
              <span className="setting-val text-bright">{backendData?.conversations_count ?? 0} sessions</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Privacy Guarantee</span>
              <span className="setting-val text-green">100% On-Device (Zero Cloud DB)</span>
            </div>
          </div>
          <div className="settings-actions-row">
            <button className="hud-button-subtle" onClick={() => onSelectView('memory')}>
              Open Memory Center
            </button>
            <button className="hud-button-subtle" onClick={() => onSelectView('conversations')}>
              Manage Sessions
            </button>
          </div>
        </div>

        {/* Section 3: Tactical Voice Synthesizer */}
        <div className="settings-section">
          <div className="settings-section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
            <h4>Audio & Vocal Synthesizer</h4>
          </div>
          <div className="settings-grid">
            <div className="setting-row">
              <span className="setting-label">Speech Recognition (PTT)</span>
              <span className={`setting-val ${voiceSupported ? 'text-green' : 'text-warn'}`}>
                {voiceSupported ? 'Supported (Web Speech API)' : 'Unsupported in Browser'}
              </span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Speech Vocalization</span>
              <span className={`setting-val ${speechSupported ? 'text-green' : 'text-warn'}`}>
                {speechSupported ? 'Supported (Web SpeechSynthesis)' : 'Unsupported in Browser'}
              </span>
            </div>
            {speechSupported && availableVoices.length > 0 && (
              <div className="setting-row-control">
                <span className="setting-label">Vocal Persona</span>
                <select
                  className="hud-select"
                  value={selectedVoice?.name || ''}
                  onChange={(e) => {
                    const match = availableVoices.find((v) => v.name === e.target.value);
                    if (match) onSelectVoice(match);
                  }}
                >
                  {availableVoices.map((v) => (
                    <option key={v.name} value={v.name}>
                      {v.name} ({v.lang})
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="setting-row-control">
              <div className="control-header">
                <span className="setting-label">Vocal Rate</span>
                <span className="control-val">{speechRate}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={speechRate}
                onChange={(e) => onRateChange(parseFloat(e.target.value))}
                className="hud-slider"
              />
            </div>
            <div className="setting-row-control">
              <div className="control-header">
                <span className="setting-label">Vocal Pitch</span>
                <span className="control-val">{speechPitch}</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.3"
                step="0.05"
                value={speechPitch}
                onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                className="hud-slider"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Host Machine & IPC Telemetry */}
        <div className="settings-section">
          <div className="settings-section-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <h4>Host Machine & IPC Server</h4>
          </div>
          <div className="settings-grid">
            <div className="setting-row">
              <span className="setting-label">IPC Endpoint</span>
              <span className="setting-val text-cyan">http://127.0.0.1:8000</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Host OS</span>
              <span className="setting-val">
                {backendData?.platform ? `${backendData.platform} (${backendData.platform_release})` : 'macOS'}
              </span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Architecture</span>
              <span className="setting-val">
                {backendData?.machine ? `Apple Silicon (${backendData.machine})` : 'arm64'}
              </span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Python Runtime</span>
              <span className="setting-val">{backendData?.python_version || 'Python 3.12'}</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Uptime</span>
              <span className="setting-val text-bright">
                {healthData?.uptime_seconds ? `${Math.floor(healthData.uptime_seconds)}s` : 'Active'}
              </span>
            </div>
          </div>
          <div className="settings-actions-row">
            <button className="hud-button-subtle" onClick={() => onSelectView('tools')}>
              Run IPC Diagnostics
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
