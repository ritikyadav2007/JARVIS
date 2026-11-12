import React from 'react';
import type { BackendStatus } from '../../types';

interface SettingsWorkspaceProps {
  backendData: BackendStatus | null;
  speechRate: number;
  speechPitch: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onRateChange: (rate: number) => void;
  onPitchChange: (pitch: number) => void;
  onVoiceChange: (voice: SpeechSynthesisVoice) => void;
  onClearHistory: () => void;
}

export const SettingsWorkspace: React.FC<SettingsWorkspaceProps> = ({
  backendData,
  speechRate,
  speechPitch,
  availableVoices,
  selectedVoice,
  onRateChange,
  onPitchChange,
  onVoiceChange,
  onClearHistory,
}) => {
  return (
    <div className="modular-workspace-container" aria-label="System Settings">
      <div className="workspace-card">
        <div className="workspace-card-title">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
          </svg>
          SETTINGS &bull; SYSTEM CONFIGURATION
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px' }}>
            <h4 style={{ color: 'var(--cyan)', fontSize: '13px', marginBottom: '12px' }}>SPEECH SYNTHESIS ENGINE</h4>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Active Voice Profile:
              </label>
              <select
                className="chat-text-input"
                style={{ width: '100%' }}
                value={selectedVoice?.name || ''}
                onChange={(e) => {
                  const v = availableVoices.find((voice) => voice.name === e.target.value);
                  if (v) onVoiceChange(v);
                }}
              >
                {availableVoices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Speech Rate ({speechRate}x):
              </label>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.05"
                value={speechRate}
                onChange={(e) => onRateChange(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan)' }}
              />
            </div>

            <div>
              <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Speech Pitch ({speechPitch}x):
              </label>
              <input
                type="range"
                min="0.8"
                max="1.3"
                step="0.05"
                value={speechPitch}
                onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--cyan)' }}
              />
            </div>
          </div>

          <div style={{ background: 'rgba(3, 17, 35, 0.7)', border: '1px solid var(--border)', borderRadius: '6px', padding: '16px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h4 style={{ color: 'var(--cyan)', fontSize: '13px', marginBottom: '12px' }}>BACKEND METADATA</h4>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div>Assistant: {backendData?.assistant_name || 'JARVIS'}</div>
                <div>Python Version: {backendData?.python_version || '3.12'}</div>
                <div>Platform: {backendData?.platform || 'Darwin'} ({backendData?.machine || 'arm64'})</div>
                <div>Phase: {backendData?.phase || 2} (Local SQLite Multi-Turn)</div>
              </div>
            </div>

            <div style={{ marginTop: '20px', paddingTop: '14px', borderTop: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Clear conversation turns stored in local SQLite:
              </div>
              <button
                onClick={onClearHistory}
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  border: '1px solid var(--red)',
                  color: '#fca5a5',
                  padding: '7px 14px',
                  borderRadius: '6px',
                  fontSize: '11px',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Clear Conversation History
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
