import React, { useState } from 'react';
import { AIState, BackendStatus, LogEntry, SystemMetrics } from '../types';
import { HolographicHumanoid } from './HolographicHumanoid';

interface CommandCenterViewProps {
  aiState: AIState;
  subtitle: string;
  isListening: boolean;
  isSpeaking: boolean;
  voiceSupported: boolean;
  audioLevel?: number;
  interimTranscript?: string;
  backendOnline: boolean | null;
  backendData: BackendStatus | null;
  systemMetrics?: SystemMetrics | null;
  logs?: LogEntry[];
  onToggleVoice: () => void;
  onStopSpeaking: () => void;
  onSendTextMessage: (text: string) => void;
  onSwitchView: (view: any) => void;
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  aiState,
  subtitle,
  isListening,
  isSpeaking,
  voiceSupported,
  audioLevel = 0,
  interimTranscript = '',
  backendOnline,
  backendData,
  systemMetrics,
  logs = [],
  onToggleVoice,
  onStopSpeaking,
  onSendTextMessage,
  onSwitchView,
}) => {
  const [chatInput, setChatInput] = useState('');

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) {
      onSendTextMessage(chatInput.trim());
      setChatInput('');
    }
  };

  // Live telemetry or pixel-accurate reference fallback values
  const cpuPct = systemMetrics?.cpu?.percent && systemMetrics.cpu.percent > 0
    ? Math.round(systemMetrics.cpu.percent)
    : (backendData?.cpu_percent && backendData.cpu_percent > 0 ? Math.round(backendData.cpu_percent) : 23);

  const ramPct = systemMetrics?.memory?.percent
    ? Math.round(systemMetrics.memory.percent)
    : (backendData?.ram_percent ? Math.round(backendData.ram_percent) : 65);

  const ramSub = systemMetrics?.memory
    ? `${systemMetrics.memory.used_gb} / ${systemMetrics.memory.total_gb} GB`
    : '10.3 / 15.6 GB';

  const diskPct = systemMetrics?.disk?.percent ? Math.round(systemMetrics.disk.percent) : 42;
  const diskSub = systemMetrics?.disk
    ? `${systemMetrics.disk.used_gb} / ${systemMetrics.disk.total_gb} GB`
    : '256 / 512 GB';

  const netPct = 68;
  const netSub = '256 / 512 GB';

  // Circular gauge component
  const CircularGauge = ({
    label,
    percent,
    subValue,
  }: {
    label: string;
    percent: number;
    subValue: string;
  }) => {
    const radius = 24;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (Math.min(100, Math.max(0, percent)) / 100) * circumference;

    return (
      <div className="ref-gauge-col">
        <span className="ref-gauge-label">{label}</span>
        <div className="ref-gauge-circle-box">
          <svg width="64" height="64" viewBox="0 0 64 64" className="ref-gauge-svg">
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="rgba(0, 240, 255, 0.14)"
              strokeWidth="4.5"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r={radius}
              stroke="#00f0ff"
              strokeWidth="4.5"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              style={{
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
                transition: 'stroke-dashoffset 0.6s ease',
                filter: 'drop-shadow(0 0 5px rgba(0, 240, 255, 0.6))',
              }}
            />
          </svg>
          <span className="ref-gauge-value">{percent}%</span>
        </div>
        <span className="ref-gauge-sub">{subValue}</span>
      </div>
    );
  };

  // Sparkline waveform generator for Performance cards
  const Sparkline = ({
    color = '#00f0ff',
    id,
  }: {
    color?: string;
    id: string;
  }) => {
    return (
      <svg width="100%" height="24" viewBox="0 0 140 24" className="sparkline-svg" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <path
          d="M 0 16 Q 18 8, 35 15 T 70 10 T 105 17 T 140 8 L 140 24 L 0 24 Z"
          fill={`url(#grad-${id})`}
        />
        <path
          d="M 0 16 Q 18 8, 35 15 T 70 10 T 105 17 T 140 8"
          fill="none"
          stroke={color}
          strokeWidth="1.8"
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
    );
  };

  return (
    <div className="ref-dashboard-fullscreen">
      {/* ─────────────────────────────────────────────────────────────
          DESK ENVIRONMENT BACKGROUND & CITY SKYLINE BLUR
          ───────────────────────────────────────────────────────────── */}
      <div className="ref-skyline-backdrop"></div>
      <div className="ref-desk-surface">
        {/* Tux Penguin on bottom-left */}
        <div className="ref-tux-mascot" title="Linux / macOS Kernel Powered">
          <svg width="38" height="46" viewBox="0 0 60 70" fill="none">
            <ellipse cx="30" cy="40" rx="18" ry="24" fill="#1e293b" />
            <ellipse cx="30" cy="42" rx="13" ry="19" fill="#f8fafc" />
            <circle cx="30" cy="20" r="14" fill="#1e293b" />
            <ellipse cx="25" cy="18" rx="2.5" ry="3.5" fill="#f8fafc" />
            <ellipse cx="35" cy="18" rx="2.5" ry="3.5" fill="#f8fafc" />
            <circle cx="26" cy="19" r="1.5" fill="#0f172a" />
            <circle cx="36" cy="19" r="1.5" fill="#0f172a" />
            <path d="M 26 23 Q 30 29 34 23 Q 30 20 26 23 Z" fill="#f59e0b" />
            <ellipse cx="18" cy="62" rx="7" ry="3.5" fill="#f59e0b" />
            <ellipse cx="42" cy="62" rx="7" ry="3.5" fill="#f59e0b" />
          </svg>
        </div>

        {/* Keyboard silhouette in center-left desk */}
        <div className="ref-keyboard-silhouette"></div>

        {/* Mouse silhouette in center-right desk */}
        <div className="ref-mouse-silhouette"></div>

        {/* Coffee mug on bottom-right */}
        <div className="ref-coffee-mug" title="#1/b cof">
          <div className="mug-body">
            <span className="mug-label">#1/b<br/>cof</span>
          </div>
          <div className="mug-handle"></div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CENTRAL HOLOGRAPHIC 3D AVATAR & PROJECTION PLATFORM
          ───────────────────────────────────────────────────────────── */}
      <div className="ref-center-avatar-stage">
        <HolographicHumanoid
          state={aiState}
          onAvatarClick={onToggleVoice}
          audioLevel={audioLevel}
          isListening={isListening}
          isSpeaking={isSpeaking}
        />
      </div>

      {/* ─────────────────────────────────────────────────────────────
          MAIN 4-COLUMN HOLOGRAPHIC HUD GRID
          ───────────────────────────────────────────────────────────── */}
      <div className="ref-hud-panoramic-container">
        {/* =========================================================
            COLUMN 1: LEFT SECTION (OVERVIEW, TERMINAL, REAL-TIME LOGS)
            ========================================================= */}
        <div className="ref-hud-col ref-col-left">
          {/* 1. SYSTEM OVERVIEW */}
          <div className="ref-hud-panel ref-panel-overview">
            <div className="ref-panel-titlebar">
              <span className="ref-panel-title">SYSTEM OVERVIEW</span>
              <div className="ref-win-controls">
                <span className="win-btn win-min">—</span>
                <span className="win-btn win-max">□</span>
                <span className="win-btn win-close">×</span>
              </div>
            </div>

            <div className="ref-gauges-grid">
              <CircularGauge label="CPU" percent={cpuPct} subValue="3.2 GHz" />
              <CircularGauge label="RAM" percent={ramPct} subValue={ramSub} />
              <CircularGauge label="DISK" percent={diskPct} subValue={diskSub} />
              <CircularGauge label="NET" percent={netPct} subValue={netSub} />
            </div>
          </div>

          {/* 2. TERMINAL */}
          <div className="ref-hud-panel ref-panel-terminal">
            <div className="ref-panel-titlebar">
              <span className="ref-panel-title">TERMINAL</span>
              <div className="ref-win-controls">
                <span className="win-btn win-min">—</span>
                <span className="win-btn win-max">□</span>
                <span className="win-btn win-close">×</span>
              </div>
            </div>

            <div className="ref-terminal-content font-mono">
              <div className="ref-term-line">
                <span className="term-user-ref">jarvis@mac</span>:<span className="term-dir-ref">~</span>$ neofetch
              </div>

              <div className="ref-term-body">
                {/* Purple Neofetch ASCII Art */}
                <div className="ref-neofetch-art">
                  <pre>
{`  .:'    \`:
 ::::...:::
 ::::::::::
 ::::''':::
  \`:...:'`}
                  </pre>
                </div>

                {/* Specs List */}
                <div className="ref-neofetch-specs">
                  <div><span className="k">OS:</span> {backendData?.platform || 'macOS'} ({backendData?.platform_release || 'Darwin 24.6'})</div>
                  <div><span className="k">Host:</span> MacBook Air ({backendData?.machine || 'Apple Silicon'})</div>
                  <div><span className="k">Kernel:</span> 25.6.0-darwin</div>
                  <div><span className="k">Uptime:</span> 3 hours, 42 mins</div>
                  <div><span className="k">Packages:</span> 2847 (brew)</div>
                  <div><span className="k">Shell:</span> zsh 5.9</div>
                  <div><span className="k">Resolution:</span> 2560x1600</div>
                  <div><span className="k">DE:</span> Aqua / Quartz</div>
                  <div><span className="k">WM:</span> WindowServer</div>
                  <div><span className="k">Theme:</span> Cyber-Cyan-Dark</div>
                  <div><span className="k">Icons:</span> SF-Pro-Dark</div>
                  <div><span className="k">Terminal:</span> jarvis-terminal</div>
                  <div><span className="k">Status:</span> <span className="term-val text-emerald">{backendOnline ? 'CORE ONLINE' : 'STANDBY'}</span></div>
                </div>
              </div>

              <div className="ref-term-line ref-term-prompt-active">
                <span className="term-user-ref">jarvis@mac</span>:<span className="term-dir-ref">~</span>$ <span className="ref-term-cursor"></span>
              </div>
            </div>
          </div>

          {/* 3. REAL-TIME LOGS */}
          <div className="ref-hud-panel ref-panel-logs">
            <div className="ref-panel-titlebar">
              <span className="ref-panel-title">REAL-TIME LOGS</span>
              <div className="ref-win-controls">
                <span className="win-btn win-min">—</span>
                <span className="win-btn win-max">□</span>
                <span className="win-btn win-close">×</span>
              </div>
            </div>

            <div className="ref-logs-list font-mono">
              {logs && logs.length > 0 ? (
                logs.slice(-5).map((log) => (
                  <div key={log.id} className="ref-log-item">
                    <span className="ref-log-time">{log.time}</span>
                    <span className={`ref-log-tag tag-${log.type}`}>
                      [{log.type === 'system' ? 'INFO' : log.type.toUpperCase()}]
                    </span>
                    <span className="ref-log-msg">{log.message}</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="ref-log-item">
                    <span className="ref-log-time">18:15:23</span>
                    <span className="ref-log-tag tag-info">[INFO]</span>
                    <span className="ref-log-msg">System scan completed</span>
                  </div>
                  <div className="ref-log-item">
                    <span className="ref-log-time">18:15:24</span>
                    <span className="ref-log-tag tag-info">[INFO]</span>
                    <span className="ref-log-msg">All services are running</span>
                  </div>
                  <div className="ref-log-item">
                    <span className="ref-log-time">18:15:25</span>
                    <span className="ref-log-tag tag-warn">[WARN]</span>
                    <span className="ref-log-msg">Disk usage at 65%</span>
                  </div>
                  <div className="ref-log-item">
                    <span className="ref-log-time">18:15:26</span>
                    <span className="ref-log-tag tag-info">[INFO]</span>
                    <span className="ref-log-msg">Backup completed</span>
                  </div>
                  <div className="ref-log-item">
                    <span className="ref-log-time">18:15:27</span>
                    <span className="ref-log-tag tag-info">[INFO]</span>
                    <span className="ref-log-msg">AI assistant ready</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================
            COLUMN 2: CENTER (CLEAN VIEWPORT FOR HOLOGRAPHIC AVATAR)
            ========================================================= */}
        <div className="ref-hud-col ref-col-center">
          {/* Subtitle / Interaction HUD Box */}
          <div className="ref-center-subtitle-box">
            {isListening && interimTranscript && (
              <div className="ref-interim-pill">
                <span className="pill-dot">●</span> "{interimTranscript}..."
              </div>
            )}
            <p className="ref-subtitle-text">{subtitle}</p>

            <div className="ref-center-voice-controls">
              <button
                className={`ref-mic-pill-btn ${isListening ? 'active' : ''}`}
                onClick={onToggleVoice}
                title={!voiceSupported ? 'Speech recognition not available' : isListening ? 'Stop listening' : 'Push to talk'}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                </svg>
                <span>{isListening ? 'LISTENING...' : 'VOICE HUD'}</span>
              </button>
              {isSpeaking && (
                <button className="ref-halt-speech-btn" onClick={onStopSpeaking} title="Mute speech synthesis">
                  HALT
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================
            COLUMN 3: RIGHT SECTION (CHAT INTERFACE, CODE, SHORTCUTS)
            ========================================================= */}
        <div className="ref-hud-col ref-col-right">
          {/* 4. AI CHAT INTERFACE */}
          <div className="ref-hud-panel ref-panel-chat">
            <div className="ref-panel-titlebar">
              <span className="ref-panel-title">AI CHAT INTERFACE</span>
              <div className="ref-win-controls">
                <span className="win-btn win-min">—</span>
                <span className="win-btn win-max win-green">□</span>
                <span className="win-btn win-close">×</span>
              </div>
            </div>

            <div className="ref-chat-body">
              {/* Message Bubble matching screenshot */}
              <div className="ref-chat-bubble">
                <p>Hello! I am <strong>JARVIS</strong>,</p>
                <p>your Personal Intelligent System Assistant.</p>
                <p>How can I help you today?</p>
              </div>

              {/* Suggestions List */}
              <div className="ref-chat-suggestions">
                <span className="sug-header">You can ask me to:</span>
                <button
                  className="sug-item"
                  onClick={() => onSendTextMessage('Optimize system performance and inspect hardware.')}
                >
                  › Optimize your system
                </button>
                <button
                  className="sug-item"
                  onClick={() => onSwitchView('dev-studio')}
                >
                  › Write or debug code
                </button>
                <button
                  className="sug-item"
                  onClick={() => onSwitchView('automation')}
                >
                  › Automate tasks
                </button>
                <button
                  className="sug-item"
                  onClick={() => onSendTextMessage('System status report and diagnostics.')}
                >
                  › Monitor performance
                </button>
                <button
                  className="sug-item"
                  onClick={() => onSwitchView('memory')}
                >
                  › And much more...
                </button>
              </div>

              {/* Input field with purple arrow button matching screenshot */}
              <form onSubmit={handleChatSubmit} className="ref-chat-form">
                <input
                  type="text"
                  className="ref-chat-input"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Ask JARVIS anything..."
                />
                <button
                  type="submit"
                  className="ref-chat-send-btn"
                  disabled={!chatInput.trim() || aiState === 'processing'}
                  title="Send Directive"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* 5. CODE SNIPPET */}
          <div className="ref-hud-panel ref-panel-code">
            <div className="ref-panel-titlebar">
              <span className="ref-panel-title">CODE SNIPPET</span>
              <div className="ref-win-controls">
                <span className="win-btn win-min">—</span>
                <span className="win-btn win-max">□</span>
                <span className="win-btn win-close">×</span>
              </div>
            </div>

            <div className="ref-code-body font-mono">
              <pre>
                <code>
{`import psutil

def system_health():
    cpu = psutil.cpu_percent()
    ram = psutil.virtual_memory().percent
    disk = psutil.disk_usage('/').percent
    return {"cpu": cpu, "ram": ram, "disk": disk}

if __name__ == "__main__":
    print(system_health())`}
                </code>
              </pre>
            </div>
          </div>

          {/* 6. SHORTCUTS */}
          <div className="ref-hud-panel ref-panel-shortcuts">
            <div className="ref-panel-titlebar">
              <span className="ref-panel-title">SHORTCUTS</span>
              <div className="ref-win-controls">
                <span className="win-btn win-min">—</span>
                <span className="win-btn win-max">□</span>
                <span className="win-btn win-close">×</span>
              </div>
            </div>

            <div className="ref-shortcuts-row">
              <button
                className="ref-shortcut-card"
                onClick={() => onSendTextMessage('Update system diagnostics and verify dependencies.')}
                title="Update System"
              >
                <div className="ref-shortcut-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"></path>
                  </svg>
                </div>
                <span className="ref-shortcut-text">Update System</span>
              </button>

              <button
                className="ref-shortcut-card"
                onClick={() => onSendTextMessage('Clean cache and optimize application storage.')}
                title="Clean Cache"
              >
                <div className="ref-shortcut-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                </div>
                <span className="ref-shortcut-text">Clean Cache</span>
              </button>

              <button
                className="ref-shortcut-card"
                onClick={() => onSendTextMessage('System status report and diagnostics.')}
                title="System Info"
              >
                <div className="ref-shortcut-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                </div>
                <span className="ref-shortcut-text">System Info</span>
              </button>

              <button
                className="ref-shortcut-card"
                onClick={() => onSendTextMessage('Verify local SQLite backup and session integrity.')}
                title="Smart Backup"
              >
                <div className="ref-shortcut-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17 21 17 13 7 13 7 21"></polyline>
                    <polyline points="7 3 7 8 15 8"></polyline>
                  </svg>
                </div>
                <span className="ref-shortcut-text">Smart Backup</span>
              </button>
            </div>
          </div>
        </div>

        {/* =========================================================
            COLUMN 4: FAR RIGHT SECTION (SYSTEM MONITOR PANEL)
            ========================================================= */}
        <div className="ref-hud-col ref-col-monitor">
          <div className="ref-hud-panel ref-panel-monitor">
            <div className="ref-panel-titlebar">
              <span className="ref-panel-title">SYSTEM MONITOR</span>
              <div className="ref-win-controls">
                <span className="win-btn win-min">—</span>
                <span className="win-btn win-max">□</span>
                <span className="win-btn win-close">×</span>
              </div>
            </div>

            <div className="ref-monitor-body">
              {/* PERFORMANCE SECTION */}
              <div className="monitor-subheading">Performance</div>

              {/* CPU Usage Wave */}
              <div className="monitor-metric-block">
                <div className="metric-row-header">
                  <span className="m-label">CPU Usage</span>
                  <span className="m-val text-cyan">{cpuPct}%</span>
                </div>
                <Sparkline color="#00f0ff" id="cpu" />
              </div>

              {/* RAM Usage Wave */}
              <div className="monitor-metric-block">
                <div className="metric-row-header">
                  <span className="m-label">RAM Usage</span>
                  <span className="m-val text-purple">{ramPct}%</span>
                </div>
                <Sparkline color="#c084fc" id="ram" />
              </div>

              {/* Disk Usage Wave */}
              <div className="monitor-metric-block">
                <div className="metric-row-header">
                  <span className="m-label">Disk Usage</span>
                  <span className="m-val text-cyan">{diskPct}%</span>
                </div>
                <Sparkline color="#00f0ff" id="disk" />
              </div>

              {/* Network Wave */}
              <div className="monitor-metric-block">
                <div className="metric-row-header">
                  <span className="m-label">Network</span>
                  <span className="m-val text-blue">1.2 Gbps</span>
                </div>
                <Sparkline color="#38bdf8" id="net" />
              </div>

              {/* PROCESSES SECTION */}
              <div className="monitor-subheading mt-2">Processes</div>

              <div className="ref-processes-table font-mono">
                <div className="proc-header-row">
                  <span>Process</span>
                </div>

                {systemMetrics?.processes && systemMetrics.processes.length > 0 ? (
                  systemMetrics.processes.slice(0, 5).map((proc) => (
                    <div key={proc.pid} className="proc-item-row">
                      <span className="proc-title">{proc.name}</span>
                    </div>
                  ))
                ) : (
                  <>
                    <div className="proc-item-row"><span className="proc-title">gnome-shell</span></div>
                    <div className="proc-item-row"><span className="proc-title">code</span></div>
                    <div className="proc-item-row"><span className="proc-title">docker</span></div>
                    <div className="proc-item-row"><span className="proc-title">firefox</span></div>
                    <div className="proc-item-row"><span className="proc-title">spotify</span></div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
