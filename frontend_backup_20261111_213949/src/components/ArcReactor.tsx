import React from 'react';
import { AIState } from '../types';

interface ArcReactorProps {
  state: AIState;
  onReactorClick: () => void;
  greeting?: string;
  isListening?: boolean;
  isSpeaking?: boolean;
  onStopSpeaking?: () => void;
}

export const ArcReactor: React.FC<ArcReactorProps> = ({
  state,
  onReactorClick,
  greeting = 'Online & Ready for instructions, Sir.',
  isListening,
  isSpeaking,
  onStopSpeaking,
}) => {
  // Color palette and state styling
  const stateConfigRecord: Record<AIState, {
    label: string;
    badgeClass: string;
    color: string;
    glow: string;
    desc: string;
    pulseClass: string;
    ringSpeed: string;
    counterSpeed: string;
  }> = {
    ready: {
      label: 'SYSTEM STANDBY',
      badgeClass: 'badge-idle',
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.45)',
      desc: greeting,
      pulseClass: 'reactor-pulse-idle',
      ringSpeed: '25s',
      counterSpeed: '18s',
    },
    idle: {
      label: 'SYSTEM STANDBY',
      badgeClass: 'badge-idle',
      color: '#00f0ff',
      glow: 'rgba(0, 240, 255, 0.45)',
      desc: greeting,
      pulseClass: 'reactor-pulse-idle',
      ringSpeed: '25s',
      counterSpeed: '18s',
    },
    listening: {
      label: 'LISTENING FOR AUDIO',
      badgeClass: 'badge-listening',
      color: '#38bdf8',
      glow: 'rgba(56, 189, 248, 0.75)',
      desc: 'Speak clearly into the microphone. Tap reactor to finish.',
      pulseClass: 'reactor-pulse-listening',
      ringSpeed: '8s',
      counterSpeed: '6s',
    },
    processing: {
      label: 'AI CORE PROCESSING',
      badgeClass: 'badge-processing',
      color: '#a855f7',
      glow: 'rgba(168, 85, 247, 0.75)',
      desc: 'Synthesizing response via Gemini & local SQLite memory...',
      pulseClass: 'reactor-pulse-processing',
      ringSpeed: '3s',
      counterSpeed: '2s',
    },
    thinking: {
      label: 'AI REASONING',
      badgeClass: 'badge-processing',
      color: '#c084fc',
      glow: 'rgba(192, 132, 252, 0.75)',
      desc: 'Formulating multi-turn response...',
      pulseClass: 'reactor-pulse-processing',
      ringSpeed: '3s',
      counterSpeed: '2s',
    },
    executing: {
      label: 'EXECUTING DIRECTIVE',
      badgeClass: 'badge-processing',
      color: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.75)',
      desc: 'Executing authorized system instruction...',
      pulseClass: 'reactor-pulse-processing',
      ringSpeed: '2.5s',
      counterSpeed: '2s',
    },
    speaking: {
      label: 'VOCALIZING RESPONSE',
      badgeClass: 'badge-speaking',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.75)',
      desc: 'Voice synthesizer active. Tap to mute.',
      pulseClass: 'reactor-pulse-speaking',
      ringSpeed: '12s',
      counterSpeed: '9s',
    },
    completed: {
      label: 'TASK COMPLETED',
      badgeClass: 'badge-idle',
      color: '#10b981',
      glow: 'rgba(16, 185, 129, 0.5)',
      desc: 'Directive finished.',
      pulseClass: 'reactor-pulse-idle',
      ringSpeed: '20s',
      counterSpeed: '15s',
    },
    error: {
      label: 'SYSTEM ALERT',
      badgeClass: 'badge-error',
      color: '#ef4444',
      glow: 'rgba(239, 68, 68, 0.75)',
      desc: 'Notice logged in activity stream. Tap to retry.',
      pulseClass: 'reactor-pulse-error',
      ringSpeed: '6s',
      counterSpeed: '4s',
    },
  };

  const stateConfig = stateConfigRecord[state] || stateConfigRecord.ready;

  return (
    <div className="arc-reactor-container">
      {/* HUD Corner Accents */}
      <div className="hud-corner top-left"></div>
      <div className="hud-corner top-right"></div>
      <div className="hud-corner bottom-left"></div>
      <div className="hud-corner bottom-right"></div>

      {/* Outer Holographic Energy Ring Assembly */}
      <div className="reactor-assembly" onClick={onReactorClick} title="Tap Arc Reactor to Toggle Voice Listening">
        {/* Ring 1 - Deep outer ticks */}
        <div
          className="reactor-ring ring-outer"
          style={{
            animationDuration: stateConfig.ringSpeed,
            borderColor: `${stateConfig.color}25`,
            borderTopColor: stateConfig.color,
          }}
        ></div>

        {/* Ring 2 - Segmented dashed counter-rotating */}
        <div
          className="reactor-ring ring-middle"
          style={{
            animationDuration: stateConfig.counterSpeed,
            borderColor: `${stateConfig.color}35`,
            borderRightColor: stateConfig.color,
            borderLeftColor: stateConfig.color,
          }}
        ></div>

        {/* Ring 3 - Golden ratio energy vents (triangles/prisms) */}
        <div
          className="reactor-ring ring-inner"
          style={{
            borderColor: `${stateConfig.color}45`,
            borderBottomColor: stateConfig.color,
          }}
        ></div>

        {/* Core Glowing Orb */}
        <div
          className={`reactor-core ${stateConfig.pulseClass}`}
          style={{
            boxShadow: `0 0 35px ${stateConfig.glow}, inset 0 0 25px ${stateConfig.glow}`,
          }}
        >
          {/* Inner holographic symbol */}
          <div className="reactor-icon">
            {state === 'listening' ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            ) : state === 'processing' ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="spin-fast">
                <line x1="12" y1="2" x2="12" y2="6"></line>
                <line x1="12" y1="18" x2="12" y2="22"></line>
                <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
                <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
                <line x1="2" y1="12" x2="6" y2="12"></line>
                <line x1="18" y1="12" x2="22" y2="12"></line>
                <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
                <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
              </svg>
            ) : state === 'speaking' ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            ) : state === 'error' ? (
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            ) : (
              // Idle state — Arc Reactor chevron emblem
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                <polyline points="2 17 12 22 22 17"></polyline>
                <polyline points="2 12 12 17 22 12"></polyline>
              </svg>
            )}
          </div>
        </div>

        {/* Audio Waveforms for Listening / Speaking */}
        {(state === 'listening' || state === 'speaking') && (
          <div className="audio-wave-bars">
            <span className="wave-bar wb-1"></span>
            <span className="wave-bar wb-2"></span>
            <span className="wave-bar wb-3"></span>
            <span className="wave-bar wb-4"></span>
            <span className="wave-bar wb-5"></span>
            <span className="wave-bar wb-4"></span>
            <span className="wave-bar wb-3"></span>
            <span className="wave-bar wb-2"></span>
            <span className="wave-bar wb-1"></span>
          </div>
        )}
      </div>

      {/* State & Assistant Identity Readout */}
      <div className="reactor-readout">
        <div className="readout-header">
          <span className="readout-title">J.A.R.V.I.S. MK-VII CORE</span>
          <span className={`readout-badge ${stateConfig.badgeClass}`}>{stateConfig.label}</span>
        </div>
        <p className="readout-desc">{stateConfig.desc}</p>

        {/* Controls Bar */}
        <div className="reactor-actions">
          <button
            className={`hud-button ${isListening ? 'hud-button-active' : ''}`}
            onClick={onReactorClick}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            </svg>
            {isListening ? 'Stop Listening' : 'Push to Talk'}
          </button>

          {isSpeaking && onStopSpeaking && (
            <button className="hud-button hud-button-warn" onClick={onStopSpeaking}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="6" y="6" width="12" height="12"></rect>
              </svg>
              Mute Voice
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
