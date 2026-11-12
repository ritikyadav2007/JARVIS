import React from 'react';

interface VoiceControlViewProps {
  isListening: boolean;
  isSpeaking: boolean;
  voiceSupported: boolean;
  speechSupported: boolean;
  permissionError: string | null;
  onToggleVoice: () => void;
  onCancelListening: () => void;
  onStopSpeaking: () => void;
  onTestSpeech: (sample: string) => void;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onSelectVoice: (voice: SpeechSynthesisVoice) => void;
  speechRate: number;
  onRateChange: (rate: number) => void;
  speechPitch: number;
  onPitchChange: (pitch: number) => void;
}

export const VoiceControlView: React.FC<VoiceControlViewProps> = ({
  isListening,
  isSpeaking,
  voiceSupported,
  speechSupported,
  permissionError,
  onToggleVoice,
  onCancelListening,
  onStopSpeaking,
  onTestSpeech,
  availableVoices,
  selectedVoice,
  onSelectVoice,
  speechRate,
  onRateChange,
  speechPitch,
  onPitchChange,
}) => {
  return (
    <div className="jarvis-card voice-control-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
              <line x1="12" y1="19" x2="12" y2="22"></line>
            </svg>
            TACTICAL AUDIO & VOICE INTERACTION HUD
          </h3>
          <p className="card-subtitle">
            Push-to-talk speech recognition & neural voice vocalizer for hands-free JARVIS operations.
          </p>
        </div>
      </div>

      {/* Permission / Unsupported Warning Banner */}
      {permissionError && (
        <div className="hud-alert-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>{permissionError}</span>
        </div>
      )}

      {/* Voice Status HUD Grid */}
      <div className="voice-status-hud">
        <div className="hud-stat-box">
          <span className="stat-label">Speech Recognition</span>
          <span className={`stat-val ${voiceSupported ? 'text-emerald' : 'text-amber'}`}>
            {voiceSupported ? 'WEB SPEECH ACTIVE' : 'UNSUPPORTED'}
          </span>
          <span className="stat-note">
            {voiceSupported ? 'Push-to-Talk Enabled' : 'Use Chrome/Edge/Safari'}
          </span>
        </div>

        <div className="hud-stat-box">
          <span className="stat-label">Speech Synthesizer</span>
          <span className={`stat-val ${speechSupported ? 'text-cyan' : 'text-amber'}`}>
            {speechSupported ? 'SYNTHESIZER ONLINE' : 'UNSUPPORTED'}
          </span>
          <span className="stat-note">
            {availableVoices.length > 0 ? `${availableVoices.length} Voices Installed` : 'Default Engine'}
          </span>
        </div>

        <div className="hud-stat-box">
          <span className="stat-label">Current Audio State</span>
          <span className={`stat-val ${isListening ? 'text-cyan' : isSpeaking ? 'text-emerald' : 'text-bright'}`}>
            {isListening ? 'MICROPHONE ACTIVE' : isSpeaking ? 'VOCALIZING RESPONSE' : 'STANDBY'}
          </span>
          <span className="stat-note">
            {isListening ? 'Listening for command...' : isSpeaking ? 'Audio stream playing...' : 'Awaiting prompt'}
          </span>
        </div>
      </div>

      {/* Central Visualizer & PTT Trigger */}
      <div className="voice-interactive-section">
        <div className="visualizer-wrapper">
          <div className={`visualizer-ring ${isListening ? 'vis-active' : isSpeaking ? 'vis-speaking' : ''}`}>
            <button
              onClick={onToggleVoice}
              disabled={!voiceSupported}
              className={`ptt-circle-button ${isListening ? 'ptt-listening' : ''}`}
              title={isListening ? 'Tap to finish voice input' : 'Tap to start push-to-talk'}
            >
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            </button>
          </div>

          <div className="ptt-indicator-text">
            <h4>{isListening ? 'LISTENING IN PROGRESS' : 'PUSH TO TALK'}</h4>
            <p>
              {isListening
                ? 'Speak your instruction now. Tap the core or button when finished.'
                : 'Click to start voice recognition, speak an instruction, and JARVIS will vocalize the reply.'}
            </p>
          </div>
        </div>

        <div className="voice-quick-controls">
          {isListening && (
            <button className="hud-button-subtle" onClick={onCancelListening}>
              Cancel Listening
            </button>
          )}

          {isSpeaking && (
            <button className="hud-button hud-button-warn" onClick={onStopSpeaking}>
              Stop Speaking
            </button>
          )}

          <button
            className="hud-button-subtle"
            onClick={() => onTestSpeech('Hello Sir. JARVIS speech synthesis is operating at peak efficiency.')}
            disabled={!speechSupported}
          >
            Test Vocalization
          </button>
        </div>
      </div>

      {/* Voice Synthesizer Tuning Settings */}
      {speechSupported && (
        <div className="voice-tuning-card">
          <h4 className="tuning-title">VOICE SYNTHESIS PARAMETERS</h4>

          <div className="tuning-grid">
            {/* Voice Selection */}
            <div className="tuning-item">
              <label className="tuning-label">Synthesizer Voice</label>
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

            {/* Speech Rate Slider */}
            <div className="tuning-item">
              <div className="slider-header">
                <label className="tuning-label">Playback Velocity</label>
                <span className="slider-val">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.7"
                max="1.5"
                step="0.1"
                value={speechRate}
                onChange={(e) => onRateChange(parseFloat(e.target.value))}
                className="hud-range"
              />
            </div>

            {/* Speech Pitch Slider */}
            <div className="tuning-item">
              <div className="slider-header">
                <label className="tuning-label">Pitch Modulation</label>
                <span className="slider-val">{speechPitch.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.8"
                max="1.4"
                step="0.1"
                value={speechPitch}
                onChange={(e) => onPitchChange(parseFloat(e.target.value))}
                className="hud-range"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
