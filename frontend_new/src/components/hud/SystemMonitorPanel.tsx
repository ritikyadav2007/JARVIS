import React, { useState, useEffect } from 'react';
import type { SystemMetrics, BackendStatus } from '../../types';

interface SystemMonitorPanelProps {
  systemMetrics: SystemMetrics | null;
  backendData: BackendStatus | null;
}

const generateSparklinePath = (data: number[], width = 180, height = 24): string => {
  if (data.length < 2) return '';
  const max = 100;
  const min = 0;
  const step = width / (data.length - 1);
  const points = data.map((val, idx) => {
    const x = idx * step;
    const normalized = Math.max(0, Math.min(100, val));
    const y = height - (normalized / (max - min)) * (height - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });

  let d = `M ${points[0]}`;
  for (let i = 1; i < points.length; i++) {
    d += ` L ${points[i]}`;
  }
  return d;
};

interface SparklineProps {
  data: number[];
  color: string;
  id: string;
}

const Sparkline: React.FC<SparklineProps> = ({ data, color, id }) => {
  const pathD = generateSparklinePath(data, 180, 24);
  const areaD = `${pathD} L 180,24 L 0,24 Z`;

  return (
    <svg className="sparkline-svg" viewBox="0 0 180 24" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaD} fill={`url(#spark-${id})`} />
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth="1.8"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
};

export const SystemMonitorPanel: React.FC<SystemMonitorPanelProps> = ({
  systemMetrics,
  backendData,
}) => {
  const [cpuHistory, setCpuHistory] = useState<number[]>([20, 24, 22, 28, 25, 23, 27, 24, 22, 26, 23, 25]);
  const [ramHistory, setRamHistory] = useState<number[]>([60, 62, 63, 64, 65, 65, 66, 65, 64, 65, 65, 66]);
  const [diskHistory, setDiskHistory] = useState<number[]>([42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42, 42]);
  const [netHistory] = useState<number[]>([35, 42, 55, 48, 62, 58, 65, 70, 68, 64, 66, 68]);

  const cpuPct = systemMetrics?.cpu?.percent ?? (backendData?.cpu_percent ? Math.round(backendData.cpu_percent) : 23);
  const ramPct = systemMetrics?.memory?.percent ?? (backendData?.ram_percent ? Math.round(backendData.ram_percent) : 65);
  const diskPct = systemMetrics?.disk?.percent ?? 42;

  useEffect(() => {
    if (systemMetrics?.cpu?.percent !== undefined) {
      setCpuHistory((prev) => [...prev.slice(1), systemMetrics.cpu.percent]);
    }
    if (systemMetrics?.memory?.percent !== undefined) {
      setRamHistory((prev) => [...prev.slice(1), systemMetrics.memory.percent]);
    }
    if (systemMetrics?.disk?.percent !== undefined) {
      setDiskHistory((prev) => [...prev.slice(1), systemMetrics.disk.percent]);
    }
  }, [systemMetrics]);

  const processes = systemMetrics?.processes && systemMetrics.processes.length > 0
    ? systemMetrics.processes
    : [
        { pid: 1, name: 'Google Chrome', cpu_percent: 12.5, memory_percent: 5.2 },
        { pid: 2, name: 'VS Code', cpu_percent: 8.2, memory_percent: 4.1 },
        { pid: 3, name: 'WindowServer', cpu_percent: 6.1, memory_percent: 3.2 },
        { pid: 4, name: 'Python', cpu_percent: 4.8, memory_percent: 2.8 },
        { pid: 5, name: 'Finder', cpu_percent: 3.2, memory_percent: 1.9 },
      ];

  return (
    <div className="hud-panel panel-monitor" aria-label="System Hardware Monitor">
      <div className="hud-panel-header">
        <span className="hud-panel-title">SYSTEM MONITOR</span>
        <div className="hud-panel-controls">
          <span className="panel-btn" title="Minimize">&mdash;</span>
          <span className="panel-btn" title="Maximize">&#9633;</span>
          <span className="panel-btn" title="Close">&times;</span>
        </div>
      </div>

      <div className="monitor-scroll-body">
        <div className="sparkline-metric-item">
          <div className="sparkline-header">
            <span className="sparkline-label">CPU Usage</span>
            <span className="sparkline-val">{Math.round(cpuPct)}%</span>
          </div>
          <Sparkline data={cpuHistory} color="#00f0ff" id="cpu" />
        </div>

        <div className="sparkline-metric-item">
          <div className="sparkline-header">
            <span className="sparkline-label">RAM Usage</span>
            <span className="sparkline-val" style={{ color: '#38bdf8' }}>{Math.round(ramPct)}%</span>
          </div>
          <Sparkline data={ramHistory} color="#38bdf8" id="ram" />
        </div>

        <div className="sparkline-metric-item">
          <div className="sparkline-header">
            <span className="sparkline-label">Disk Usage</span>
            <span className="sparkline-val" style={{ color: '#8b5cf6' }}>{Math.round(diskPct)}%</span>
          </div>
          <Sparkline data={diskHistory} color="#8b5cf6" id="disk" />
        </div>

        <div className="sparkline-metric-item">
          <div className="sparkline-header">
            <span className="sparkline-label">Network</span>
            <span className="sparkline-val" style={{ color: '#00f0ff', fontSize: '9px' }}>
              &uarr; 256 MB/s &darr; 128 MB/s
            </span>
          </div>
          <Sparkline data={netHistory} color="#00f0ff" id="net" />
        </div>

        <div className="processes-section-title">Processes</div>
        <table className="processes-table">
          <thead>
            <tr>
              <th>Process</th>
              <th>CPU</th>
              <th>MEM</th>
            </tr>
          </thead>
          <tbody>
            {processes.slice(0, 5).map((p) => (
              <tr key={p.pid}>
                <td title={p.name}>{p.name.length > 14 ? `${p.name.slice(0, 13)}…` : p.name}</td>
                <td>{p.cpu_percent}%</td>
                <td>{Math.round(p.memory_percent * 100)} MB</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
