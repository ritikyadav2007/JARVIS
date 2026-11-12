import React from 'react';
import type { SystemMetrics, BackendStatus } from '../../types';

interface SystemOverviewPanelProps {
  systemMetrics: SystemMetrics | null;
  backendData: BackendStatus | null;
}

interface GaugeCircleProps {
  label: string;
  pct: number;
  sub: string;
  color?: string;
}

const GaugeCircle: React.FC<GaugeCircleProps> = ({
  label,
  pct,
  sub,
  color = '#00f0ff',
}) => {
  const radius = 21;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, pct)) / 100) * circumference;

  return (
    <div className="gauge-item">
      <span className="gauge-label">{label}</span>
      <div className="gauge-svg-wrap">
        <svg width="52" height="52" viewBox="0 0 52 52">
          <circle
            cx="26"
            cy="26"
            r={radius}
            stroke="rgba(0, 240, 255, 0.12)"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx="26"
            cy="26"
            r={radius}
            stroke={color}
            strokeWidth="4"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transform: 'rotate(-90deg)',
              transformOrigin: '50% 50%',
              transition: 'stroke-dashoffset 0.6s ease',
              filter: `drop-shadow(0 0 4px ${color})`,
            }}
          />
        </svg>
        <span className="gauge-pct-text">{Math.round(pct)}%</span>
      </div>
      <span className="gauge-sub-value">{sub}</span>
    </div>
  );
};

export const SystemOverviewPanel: React.FC<SystemOverviewPanelProps> = ({
  systemMetrics,
  backendData,
}) => {
  const cpuPct = systemMetrics?.cpu?.percent ?? (backendData?.cpu_percent ? Math.round(backendData.cpu_percent) : 23);
  const ramPct = systemMetrics?.memory?.percent ?? (backendData?.ram_percent ? Math.round(backendData.ram_percent) : 65);
  const ramSub = systemMetrics?.memory
    ? `${systemMetrics.memory.used_gb} / ${systemMetrics.memory.total_gb} GB`
    : '10.3 / 15.6 GB';

  const diskPct = systemMetrics?.disk?.percent ?? 42;
  const diskSub = systemMetrics?.disk
    ? `${systemMetrics.disk.used_gb} / ${systemMetrics.disk.total_gb} GB`
    : '256 / 512 GB';

  const netPct = 68;
  const netSub = systemMetrics?.network
    ? `${Math.round(systemMetrics.network.bytes_recv_mb)} MB/s`
    : '256 MB/s';

  return (
    <div className="hud-panel panel-overview" aria-label="System Overview">
      <div className="hud-panel-header">
        <span className="hud-panel-title">SYSTEM OVERVIEW</span>
        <div className="hud-panel-controls">
          <span className="panel-btn" title="Minimize">&mdash;</span>
          <span className="panel-btn" title="Maximize">&#9633;</span>
          <span className="panel-btn" title="Close">&times;</span>
        </div>
      </div>

      <div className="gauges-4-row">
        <GaugeCircle label="CPU" pct={cpuPct} sub="3.2 GHz" color="#00f0ff" />
        <GaugeCircle label="RAM" pct={ramPct} sub={ramSub} color="#38bdf8" />
        <GaugeCircle label="DISK" pct={diskPct} sub={diskSub} color="#087cff" />
        <GaugeCircle label="NET" pct={netPct} sub={netSub} color="#00f0ff" />
      </div>
    </div>
  );
};
