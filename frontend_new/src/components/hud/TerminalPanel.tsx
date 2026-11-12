import React, { useState, useEffect } from 'react';
import type { BackendStatus, HealthStatus } from '../../types';

interface TerminalPanelProps {
  backendData: BackendStatus | null;
  healthData: HealthStatus | null;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({
  backendData,
  healthData,
}) => {
  const [resolution, setResolution] = useState<string>('1440x900');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setResolution(`${window.innerWidth}x${window.innerHeight}`);
      const handleResize = () => setResolution(`${window.innerWidth}x${window.innerHeight}`);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  const formatUptimeStr = (seconds?: number): string => {
    if (!seconds && seconds !== 0) return '2h 44m';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  return (
    <div className="hud-panel panel-terminal" aria-label="System Terminal">
      <div className="hud-panel-header">
        <span className="hud-panel-title">TERMINAL</span>
        <div className="hud-panel-controls">
          <span className="panel-btn" title="Minimize">&mdash;</span>
          <span className="panel-btn" title="Maximize">&#9633;</span>
          <span className="panel-btn" title="Close">&times;</span>
        </div>
      </div>

      <div className="terminal-inner">
        <div className="terminal-prompt-line">
          <span className="t-user">jarvis</span>@<span className="t-host">macbook</span>:<span className="t-dir">~</span>$ neofetch
        </div>

        <div className="terminal-split">
          <div className="apple-rainbow-logo" aria-hidden="true">
            <svg width="44" height="52" viewBox="0 0 170 200" fill="none">
              <path d="M105 20 C115 5 130 0 135 0 C135 15 125 30 110 35 C100 40 95 30 105 20 Z" fill="#61bb46" />
              <g clipPath="url(#apple-clip)">
                <rect x="0" y="30" width="170" height="28" fill="#61bb46" />
                <rect x="0" y="58" width="170" height="28" fill="#fdb827" />
                <rect x="0" y="86" width="170" height="28" fill="#f58220" />
                <rect x="0" y="114" width="170" height="28" fill="#e03a3e" />
                <rect x="0" y="142" width="170" height="28" fill="#963d97" />
                <rect x="0" y="170" width="170" height="30" fill="#009ddc" />
              </g>
              <clipPath id="apple-clip">
                <path d="M85 45 C95 30 115 32 125 36 C145 44 158 60 152 82 C148 98 138 114 140 128 C142 142 154 150 148 165 C140 185 125 198 108 198 C95 198 90 190 76 190 C62 190 56 198 44 198 C28 198 12 182 4 160 C-8 126 5 80 32 58 C45 46 62 42 75 48 C80 50 82 50 85 45 Z" />
              </clipPath>
            </svg>
          </div>

          <div className="terminal-specs-table">
            <div className="spec-row">
              <span className="k">OS:</span>
              <span className="v">{backendData?.platform ? `${backendData.platform} ${backendData.platform_release || '14.4.1'}` : 'macOS 14.4.1'}</span>
            </div>
            <div className="spec-row">
              <span className="k">Host:</span>
              <span className="v">MacBook Air ({backendData?.machine || 'Apple Silicon'})</span>
            </div>
            <div className="spec-row">
              <span className="k">Kernel:</span>
              <span className="v">{backendData?.platform_release || '23.4.0'}</span>
            </div>
            <div className="spec-row">
              <span className="k">Uptime:</span>
              <span className="v">{formatUptimeStr(healthData?.uptime_seconds)}</span>
            </div>
            <div className="spec-row">
              <span className="k">Packages:</span>
              <span className="v">245</span>
            </div>
            <div className="spec-row">
              <span className="k">Shell:</span>
              <span className="v">zsh 5.9</span>
            </div>
            <div className="spec-row">
              <span className="k">Resolution:</span>
              <span className="v">{resolution}</span>
            </div>
            <div className="spec-row">
              <span className="k">DE:</span>
              <span className="v">Aqua</span>
            </div>
            <div className="spec-row">
              <span className="k">WM:</span>
              <span className="v">yabai</span>
            </div>
            <div className="spec-row">
              <span className="k">Theme:</span>
              <span className="v">Dark</span>
            </div>
            <div className="spec-row">
              <span className="k">Icons:</span>
              <span className="v">SF Symbols</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
