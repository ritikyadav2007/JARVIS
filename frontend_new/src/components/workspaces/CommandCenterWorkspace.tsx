import React from 'react';
import type {
  AIState,
  ActiveView,
  BackendStatus,
  HealthStatus,
  SystemMetrics,
  LogEntry,
  ChatMessage,
} from '../../types';

import { SystemOverviewPanel } from '../hud/SystemOverviewPanel';
import { TerminalPanel } from '../hud/TerminalPanel';
import { RealTimeLogsPanel } from '../hud/RealTimeLogsPanel';
import { HolographicAvatar } from '../hologram/HolographicAvatar';
import { AIChatPanel } from '../hud/AIChatPanel';
import { CodeSnippetPanel } from '../hud/CodeSnippetPanel';
import { ShortcutsPanel } from '../hud/ShortcutsPanel';
import { SystemMonitorPanel } from '../hud/SystemMonitorPanel';
import { DeskEnvironment } from '../hud/DeskEnvironment';
import { TaskPipeline } from '../hud/TaskPipeline';

interface CommandCenterWorkspaceProps {
  aiState: AIState;
  subtitle: string;
  isListening: boolean;
  isSpeaking: boolean;
  voiceSupported: boolean;
  audioLevel: number;
  interimTranscript: string;
  backendOnline: boolean | null;
  backendData: BackendStatus | null;
  healthData: HealthStatus | null;
  systemMetrics: SystemMetrics | null;
  logs: LogEntry[];
  chatMessages: ChatMessage[];
  isLoadingChat: boolean;
  onSendMessage: (msg: string) => void;
  onToggleVoice: () => void;
  onStopSpeaking: () => void;
  onNavigate: (view: ActiveView) => void;
}

export const CommandCenterWorkspace: React.FC<CommandCenterWorkspaceProps> = ({
  aiState,
  subtitle,
  isListening,
  isSpeaking,
  voiceSupported,
  audioLevel,
  interimTranscript,
  backendData,
  healthData,
  systemMetrics,
  logs,
  chatMessages,
  isLoadingChat,
  onSendMessage,
  onToggleVoice,
  onStopSpeaking,
  onNavigate,
}) => {
  return (
    <div className="command-center-hud">
      <div className="hud-panoramic-stage">
        <div className="hud-col-left">
          <SystemOverviewPanel systemMetrics={systemMetrics} backendData={backendData} />
          <TerminalPanel backendData={backendData} healthData={healthData} />
          <RealTimeLogsPanel logs={logs} />
        </div>

        <div className="hud-col-center">
          <HolographicAvatar
            state={aiState}
            subtitle={subtitle}
            isListening={isListening}
            isSpeaking={isSpeaking}
            voiceSupported={voiceSupported}
            audioLevel={audioLevel}
            interimTranscript={interimTranscript}
            onToggleVoice={onToggleVoice}
            onStopSpeaking={onStopSpeaking}
          />
        </div>

        <div className="hud-col-right">
          <AIChatPanel
            messages={chatMessages}
            onSendMessage={onSendMessage}
            isLoading={isLoadingChat}
            aiState={aiState}
          />
          <CodeSnippetPanel />
          <ShortcutsPanel
            onTriggerAction={(actionText) => onSendMessage(actionText)}
            onNavigate={onNavigate}
          />
        </div>

        <div className="hud-col-monitor">
          <SystemMonitorPanel systemMetrics={systemMetrics} backendData={backendData} />
        </div>
      </div>

      <DeskEnvironment />

      <TaskPipeline aiState={aiState} />
    </div>
  );
};
