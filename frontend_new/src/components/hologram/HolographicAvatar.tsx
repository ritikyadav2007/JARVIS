import React, { useMemo } from 'react';
import type { AIState } from '../../types';
import avatarImg from '../../assets/avatar_reference.png';

interface HolographicAvatarProps {
  state: AIState;
  subtitle: string;
  isListening: boolean;
  isSpeaking: boolean;
  voiceSupported: boolean;
  audioLevel?: number;
  interimTranscript?: string;
  onToggleVoice: () => void;
  onStopSpeaking: () => void;
}

export const HolographicAvatar: React.FC<HolographicAvatarProps> = ({
  state,
  subtitle,
  isListening,
  isSpeaking,
  audioLevel = 0,
  interimTranscript = '',
  onToggleVoice,
  onStopSpeaking,
}) => {
  const stateColor = useMemo(() => {
    switch (state) {
      case 'listening':
        return '#38bdf8';
      case 'thinking':
      case 'processing':
      case 'executing':
        return '#8b5cf6';
      case 'speaking':
        return '#10b981';
      case 'error':
        return '#ef4444';
      case 'ready':
      case 'idle':
      case 'completed':
      default:
        return '#00f0ff';
    }
  }, [state]);

  const waveHeights = useMemo(() => {
    const bars = [10, 16, 24, 18, 12, 20, 26, 26, 20, 12, 18, 24, 16, 10];
    const multiplier = isSpeaking ? 1.4 : isListening ? 1.0 + audioLevel * 1.8 : 0.6;
    return bars.map((base) => {
      return Math.max(4, Math.min(28, base * multiplier));
    });
  }, [isSpeaking, isListening, audioLevel]);

  return (
    <div className="central-avatar-stage" aria-label="JARVIS Holographic Avatar Stage">
      <div
        className="avatar-hologram-wrapper"
        onClick={onToggleVoice}
        title="Tap to Toggle Voice HUD"
      >
        <img
          src={avatarImg}
          alt="JARVIS Holographic AI Avatar"
          className="avatar-hologram-img"
          style={{
            filter: `drop-shadow(0 0 25px ${stateColor}80) brightness(1.1) contrast(1.15)`,
          }}
        />

        <div className="orbital-rings-stage">
          <div
            className="orbital-ring orbital-ring-1"
            style={{ borderColor: `${stateColor}aa`, boxShadow: `0 0 20px ${stateColor}66` }}
          />
          <div
            className="orbital-ring orbital-ring-2"
            style={{ borderColor: `${stateColor}88` }}
          />
          <div
            className="orbital-ring orbital-ring-3"
            style={{ borderColor: state === 'thinking' ? '#c084fc' : `${stateColor}66` }}
          />
        </div>

        <div
          className="scanning-beam-line"
          style={{
            background: `linear-gradient(90deg, transparent 0%, ${stateColor} 50%, transparent 100%)`,
            boxShadow: `0 0 12px ${stateColor}`,
            animationDuration: state === 'thinking' ? '2.5s' : '5s',
          }}
        />

        <span className="ambient-particle" style={{ top: '30%', left: '25%', width: '3px', height: '3px', animationDelay: '0s' }} />
        <span className="ambient-particle" style={{ top: '45%', left: '75%', width: '4px', height: '4px', animationDelay: '1.2s' }} />
        <span className="ambient-particle" style={{ top: '60%', left: '20%', width: '3px', height: '3px', animationDelay: '2.5s' }} />
        <span className="ambient-particle" style={{ top: '25%', left: '65%', width: '2px', height: '2px', animationDelay: '3.8s' }} />
      </div>

      <div className="hologram-pedestal">
        <div
          className="pedestal-light-cone"
          style={{
            background: `linear-gradient(to top, ${stateColor}33 0%, transparent 90%)`,
          }}
        />
        <div
          className="pedestal-emitter-rings"
          style={{
            borderColor: stateColor,
            boxShadow: `0 0 25px ${stateColor}88, inset 0 0 15px ${stateColor}66`,
            background: `radial-gradient(ellipse at center, ${stateColor}44 0%, transparent 70%)`,
          }}
        />
      </div>

      <div className="avatar-subtitle-card">
        {isListening && interimTranscript ? (
          <>
            <div className="sub-line1" style={{ color: '#38bdf8' }}>
              &bull; Listening:
            </div>
            <div className="sub-line2">&ldquo;{interimTranscript}&rdquo;</div>
          </>
        ) : (
          <>
            <div className="sub-line1">
              Hello! I am <strong>JARVIS</strong>.
            </div>
            <div className="sub-line2">{subtitle || 'How can I help you today?'}</div>
          </>
        )}
      </div>

      <div className="hud-voice-strip">
        <div className="waveform-canvas-box" aria-hidden="true">
          {waveHeights.slice(0, 7).map((h, i) => (
            <div
              key={`wl-${i}`}
              className="wave-bar"
              style={{
                height: `${h}px`,
                backgroundColor: stateColor,
                boxShadow: `0 0 4px ${stateColor}`,
              }}
            />
          ))}
        </div>

        <button
          className={`mic-circular-btn ${isListening ? 'listening' : ''}`}
          onClick={onToggleVoice}
          title={isListening ? 'Stop Listening' : 'Push to Talk'}
          aria-label={isListening ? 'Stop Listening' : 'Push to Talk'}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
            <line x1="12" y1="19" x2="12" y2="22"></line>
          </svg>
        </button>

        <div className="waveform-canvas-box" aria-hidden="true">
          {waveHeights.slice(7, 14).map((h, i) => (
            <div
              key={`wr-${i}`}
              className="wave-bar"
              style={{
                height: `${h}px`,
                backgroundColor: stateColor,
                boxShadow: `0 0 4px ${stateColor}`,
              }}
            />
          ))}
        </div>

        {isSpeaking && (
          <button
            className="voice-mute-btn"
            onClick={onStopSpeaking}
            title="Halt Speech Output"
            aria-label="Mute Voice"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="6" y="6" width="12" height="12"></rect>
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
