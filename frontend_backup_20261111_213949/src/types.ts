/**
 * JARVIS — Core Types & Interfaces
 */

export type AIState =
  | 'ready'
  | 'idle'
  | 'listening'
  | 'processing'
  | 'thinking'
  | 'executing'
  | 'speaking'
  | 'completed'
  | 'error';

export type ActiveView =
  | 'command-center'
  | 'chat'
  | 'voice'
  | 'dev-studio'
  | 'projects'
  | 'mac-control'
  | 'phone-hub'
  | 'automation'
  | 'memory'
  | 'security'
  | 'settings'
  | 'home'
  | 'conversations'
  | 'tools';

export interface BackendStatus {
  assistant_name: string;
  status: string;
  platform: string;
  platform_release: string;
  machine: string;
  python_version: string;
  phase: number;
  database?: string;
  memories_count?: number;
  conversations_count?: number;
  cpu_percent?: number;
  ram_percent?: number;
}

export interface ProcessItem {
  pid: number;
  name: string;
  cpu_percent: number;
  memory_percent: number;
}

export interface SystemMetrics {
  cpu: {
    percent: number;
    cores: number;
  };
  memory: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    percent: number;
  };
  disk: {
    total_gb: number;
    used_gb: number;
    free_gb: number;
    percent: number;
  };
  network: {
    bytes_sent_mb: number;
    bytes_recv_mb: number;
  };
  processes: ProcessItem[];
  error?: string;
}

export interface HealthStatus {
  status: string;
  uptime_seconds: number;
}

export interface LogEntry {
  id: string;
  time: string;
  type: 'system' | 'user' | 'assistant' | 'warning';
  message: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  type: 'conversation' | 'memory' | 'system';
  detail?: string;
}
