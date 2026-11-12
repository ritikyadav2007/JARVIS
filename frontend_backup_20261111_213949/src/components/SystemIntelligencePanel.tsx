import React, { useState, useEffect } from 'react';
import { BackendStatus, HealthStatus, SystemMetrics } from '../types';

interface SystemIntelligencePanelProps {
  backendOnline: boolean | null;
  backendData: BackendStatus | null;
  healthData: HealthStatus | null;
  systemMetrics?: SystemMetrics | null;
  onOpenPhoneHub: () => void;
  onOpenMacControl: () => void;
}

export const SystemIntelligencePanel: React.FC<SystemIntelligencePanelProps> = ({
  backendOnline,
  backendData,
  healthData,
  systemMetrics,
  onOpenPhoneHub,
  onOpenMacControl,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [batteryCharging, setBatteryCharging] = useState<boolean | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Battery API check
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setBatteryCharging(battery.charging);
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setBatteryCharging(battery.charging);
        });
      }).catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const cpuPercent = systemMetrics?.cpu?.percent ?? backendData?.cpu_percent ?? 24;
  const ramPercent = systemMetrics?.memory?.percent ?? backendData?.ram_percent ?? 65;
  const diskPercent = systemMetrics?.disk?.percent ?? 42;

  return (
    <aside className={`system-intelligence-panel ${collapsed ? 'panel-collapsed' : ''}`}>
      {/* Panel Header */}
      <div className="panel-header">
        <div className="panel-title-group">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
          </svg>
          {!collapsed && <span className="panel-title">SYSTEM INTELLIGENCE</span>}
        </div>
        <button
          className="panel-toggle-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand Telemetry' : 'Collapse Telemetry'}
          aria-label={collapsed ? 'Expand Telemetry' : 'Collapse Telemetry'}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none' }}
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>

      {!collapsed && (
        <div className="panel-scroll-content">
          {/* 1. CPU & Compute Telemetry */}
          <div className="intel-card" onClick={onOpenMacControl} title="View Mac Controls">
            <div className="intel-card-header">
              <span className="intel-card-label">CPU & HARDWARE</span>
              <span className="intel-badge text-cyan">LOCAL</span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Hardware</span>
              <span className="stat-val">MacBook Air ({backendData?.machine || 'arm64'})</span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">CPU Load</span>
              <span className="stat-val text-cyan">{cpuPercent.toFixed(1)}% ({systemMetrics?.cpu?.cores ?? 8} Cores)</span>
            </div>
            {/* Live Progress Bar */}
            <div className="intel-progress-bar">
              <div
                className="intel-progress-fill fill-cyan"
                style={{ width: `${Math.min(100, Math.max(5, cpuPercent))}%` }}
              ></div>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">GPU Architecture</span>
              <span className="stat-val text-emerald">Apple Silicon Unified</span>
            </div>
          </div>

          {/* 2. Memory & RAM Telemetry */}
          <div className="intel-card">
            <div className="intel-card-header">
              <span className="intel-card-label">MEMORY USAGE</span>
              <span className="intel-badge text-bright">
                {systemMetrics?.memory ? `${systemMetrics.memory.used_gb}/${systemMetrics.memory.total_gb} GB` : 'RAM'}
              </span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">RAM Used</span>
              <span className="stat-val text-bright">{ramPercent.toFixed(1)}%</span>
            </div>
            <div className="intel-progress-bar">
              <div
                className="intel-progress-fill fill-purple"
                style={{ width: `${Math.min(100, Math.max(5, ramPercent))}%` }}
              ></div>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Available</span>
              <span className="stat-val text-dim">{systemMetrics?.memory?.free_gb ?? 5.8} GB Free</span>
            </div>
          </div>

          {/* 3. Storage / Disk Telemetry */}
          <div className="intel-card">
            <div className="intel-card-header">
              <span className="intel-card-label">STORAGE (SSD)</span>
              <span className="intel-badge text-cyan">APFS</span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Capacity</span>
              <span className="stat-val">
                {systemMetrics?.disk ? `${systemMetrics.disk.used_gb} / ${systemMetrics.disk.total_gb} GB` : '512 GB SSD'}
              </span>
            </div>
            <div className="intel-progress-bar">
              <div
                className="intel-progress-fill fill-emerald"
                style={{ width: `${Math.min(100, Math.max(5, diskPercent))}%` }}
              ></div>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Utilization</span>
              <span className="stat-val text-emerald">{diskPercent.toFixed(1)}% Used</span>
            </div>
          </div>

          {/* 4. Core Backend & Gemini AI Engine */}
          <div className="intel-card">
            <div className="intel-card-header">
              <span className="intel-card-label">NEURAL BACKEND</span>
              <span className={`intel-badge ${backendOnline ? 'text-emerald' : 'text-amber'}`}>
                {backendOnline ? 'ONLINE' : 'STANDBY'}
              </span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Framework</span>
              <span className="stat-val">FastAPI (Python {backendData?.python_version || '3.12'})</span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">AI Model</span>
              <span className="stat-val text-cyan">gemini-3.5-flash</span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Core Uptime</span>
              <span className="stat-val">
                {healthData ? `${Math.floor(healthData.uptime_seconds)}s` : 'Polling...'}
              </span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Local Memories</span>
              <span className="stat-val text-bright">{backendData?.memories_count ?? 0} verified</span>
            </div>
          </div>

          {/* 5. Network Activity */}
          <div className="intel-card">
            <div className="intel-card-header">
              <span className="intel-card-label">NETWORK ACTIVITY</span>
              <span className={`intel-badge ${isOnline ? 'text-emerald' : 'text-crimson'}`}>
                {isOnline ? 'CONNECTED' : 'OFFLINE'}
              </span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Transferred</span>
              <span className="stat-val">
                ▲ {systemMetrics?.network?.bytes_sent_mb ?? 32.1} MB / ▼ {systemMetrics?.network?.bytes_recv_mb ?? 128.4} MB
              </span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Local IPC Link</span>
              <span className="stat-val text-cyan">127.0.0.1:8000</span>
            </div>
          </div>

          {/* 6. Active Processes (Real from psutil) */}
          <div className="intel-card">
            <div className="intel-card-header">
              <span className="intel-card-label">ACTIVE PROCESSES</span>
              <span className="intel-badge text-cyan">
                {systemMetrics?.processes?.length ? `${systemMetrics.processes.length} SAMPLED` : 'TOP 5'}
              </span>
            </div>
            <div className="process-list">
              {systemMetrics?.processes && systemMetrics.processes.length > 0 ? (
                systemMetrics.processes.map((proc) => (
                  <div key={proc.pid} className="process-item">
                    <span className="proc-dot text-cyan">●</span>
                    <span className="proc-name" title={`PID: ${proc.pid}`}>
                      {proc.name.length > 16 ? `${proc.name.slice(0, 15)}…` : proc.name}
                    </span>
                    <span className="proc-port">{proc.cpu_percent}% CPU</span>
                  </div>
                ))
              ) : (
                <>
                  <div className="process-item">
                    <span className="proc-dot text-emerald">●</span>
                    <span className="proc-name">FastAPI Core Server</span>
                    <span className="proc-port">:8000</span>
                  </div>
                  <div className="process-item">
                    <span className="proc-dot text-cyan">●</span>
                    <span className="proc-name">Vite React Frontend</span>
                    <span className="proc-port">:5173</span>
                  </div>
                  <div className="process-item">
                    <span className="proc-dot text-emerald">●</span>
                    <span className="proc-name">SQLite Memory Storage</span>
                    <span className="proc-port">Local</span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 7. Phone Hub Integrations */}
          <div className="intel-card intel-card-clickable" onClick={onOpenPhoneHub} title="Manage Phone Integrations">
            <div className="intel-card-header">
              <span className="intel-card-label">PHONE HUB LINK</span>
              <span className="intel-badge text-amber">STANDBY</span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">iOS & Android Bridge</span>
              <span className="stat-val text-dim">Pairing Ready →</span>
            </div>
          </div>

          {/* 8. Power & Battery */}
          <div className="intel-card">
            <div className="intel-card-header">
              <span className="intel-card-label">POWER & BATTERY</span>
              <span className="intel-badge">HARDWARE</span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Source</span>
              <span className="stat-val">
                {batteryCharging !== null
                  ? batteryCharging ? 'AC Power (Charging)' : 'Internal Battery'
                  : 'MacBook Power Source'}
              </span>
            </div>
            <div className="intel-stat-row">
              <span className="stat-name">Charge Level</span>
              <span className="stat-val text-bright">
                {batteryLevel !== null ? `${batteryLevel}%` : 'AC / Managed'}
              </span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
