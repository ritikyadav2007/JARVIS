/**
 * JARVIS — Neural Command HUD Type Definitions
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
  | 'dev-studio'
  | 'projects'
  | 'mac-control'
  | 'phone-hub'
  | 'automation'
  | 'security'
  | 'memory'
  | 'settings';

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
  type: 'info' | 'system' | 'warn' | 'error';
  message: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  time: string;
}

export interface MemoryItem {
  id: string;
  category: 'preference' | 'project' | 'goal' | 'fact' | 'other';
  content: string;
  source: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationItem {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface PipelineStage {
  id: number;
  key: string;
  title: string;
  desc: string;
  icon: string;
  status: 'idle' | 'active' | 'completed';
}

