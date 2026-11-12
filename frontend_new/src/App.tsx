import { useState, useEffect, useCallback } from 'react';
import {
  sendChatMessage,
  fetchStatus,
  fetchHealth,
  fetchSystemMetrics,
  clearAllConversations,
  ChatError,
} from './services/api';
import type {
  AIState,
  ActiveView,
  BackendStatus,
  HealthStatus,
  SystemMetrics,
  LogEntry,
  ChatMessage,
} from './types';
import { useVoice } from './hooks/useVoice';

// Layout & Workspaces
import { TopSystemBar } from './components/layout/TopSystemBar';
import { Sidebar } from './components/layout/Sidebar';
import { CommandCenterWorkspace } from './components/workspaces/CommandCenterWorkspace';
import { DevStudioWorkspace } from './components/workspaces/DevStudioWorkspace';
import { ProjectManagerWorkspace } from './components/workspaces/ProjectManagerWorkspace';
import { MacControlWorkspace } from './components/workspaces/MacControlWorkspace';
import { PhoneHubWorkspace } from './components/workspaces/PhoneHubWorkspace';
import { AutomationCenterWorkspace } from './components/workspaces/AutomationCenterWorkspace';
import { SecurityCenterWorkspace } from './components/workspaces/SecurityCenterWorkspace';
import { MemoryCenterWorkspace } from './components/workspaces/MemoryCenterWorkspace';
import { SettingsWorkspace } from './components/workspaces/SettingsWorkspace';

import './styles/hud.css';

const INITIAL_LOGS: LogEntry[] = [
  {
    id: 'init-1',
    time: '21:42:16',
    type: 'system',
    message: 'JARVIS Neural Command HUD online. Telemetry stream connected.',
  },
  {
    id: 'init-2',
    time: '21:42:15',
    type: 'info',
    message: 'Gemini 3.5 Flash Interactions API handshake verified.',
  },
  {
    id: 'init-3',
    time: '21:42:14',
    type: 'system',
    message: 'System metrics updated.',
  },
  {
    id: 'init-4',
    time: '21:42:12',
    type: 'info',
    message: 'Memory loaded from backend/data/jarvis.db.',
  },
];

export default function App() {
  // Navigation
  const [activeView, setActiveView] = useState<ActiveView>('command-center');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Backend Telemetry
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [backendData, setBackendData] = useState<BackendStatus | null>(null);
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);

  // Chat & AI State
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [previousInteractionId, setPreviousInteractionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [subtitle, setSubtitle] = useState<string>('How can I help you today?');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);

  // Voice Interaction Hook
  const voice = useVoice({
    onTranscript: (transcript) => {
      if (transcript.trim() && !isLoadingChat) {
        handleSendMessage(transcript.trim(), true);
      }
    },
  });

  // Calculate dynamic AI state
  const computeAIState = (): AIState => {
    if (hasError) return 'error';
    if (voice.isSpeaking) return 'speaking';
    if (isLoadingChat) return 'processing';
    if (voice.isListening) return 'listening';
    return 'ready';
  };

  const aiState = computeAIState();

  // Periodic Telemetry Refresh
  const refreshTelemetry = useCallback(async () => {
    try {
      const [status, health, metrics] = await Promise.all([
        fetchStatus(),
        fetchHealth(),
        fetchSystemMetrics().catch(() => null),
      ]);
      setBackendData(status);
      setHealthData(health);
      if (metrics) setSystemMetrics(metrics);
      setBackendOnline(true);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    void refreshTelemetry();
    const interval = setInterval(refreshTelemetry, 8000);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  // Handle Sending Chat Directives
  const handleSendMessage = async (text: string, autoVocalize = false) => {
    const trimmed = text.trim();
    if (!trimmed || isLoadingChat) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });

    // Append to Chat history
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      content: trimmed,
      time: timeStr,
    };
    setChatMessages((prev) => [...prev, userMsg]);

    // Append to Logs
    setLogs((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}`,
        time: timeStr,
        type: 'info',
        message: `Directive: "${trimmed.slice(0, 48)}"`,
      },
    ]);

    setIsLoadingChat(true);
    setHasError(false);
    setSubtitle(`"${trimmed}"`);

    try {
      const res = await sendChatMessage(
        trimmed,
        previousInteractionId ?? undefined,
        conversationId ?? undefined
      );

      const asstTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const asstMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        content: res.reply,
        time: asstTime,
      };

      setChatMessages((prev) => [...prev, asstMsg]);
      setSubtitle(res.reply);

      if (res.interaction_id) setPreviousInteractionId(res.interaction_id);
      if (res.conversation_id) setConversationId(res.conversation_id);

      setLogs((prev) => [
        ...prev,
        {
          id: `log-res-${Date.now()}`,
          time: asstTime,
          type: 'system',
          message: 'Inference complete. Response received.',
        },
      ]);

      if (autoVocalize && voice.speechSupported) {
        voice.speakText(res.reply);
      }
    } catch (err: any) {
      setHasError(true);
      const friendly = err instanceof ChatError ? err.message : 'Unable to connect to AI brain.';
      setSubtitle(friendly);

      const errTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      setLogs((prev) => [
        ...prev,
        {
          id: `log-err-${Date.now()}`,
          time: errTime,
          type: 'error',
          message: friendly,
        },
      ]);

      setTimeout(() => setHasError(false), 5000);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Wipe all conversation history stored in local SQLite database?')) {
      return;
    }
    try {
      await clearAllConversations(true);
      setChatMessages([]);
      setPreviousInteractionId(null);
      setConversationId(null);
      setSubtitle('Conversation memory cleared.');
    } catch (err: any) {
      alert(err?.message || 'Failed to clear conversations');
    }
  };

  return (
    <div className="hud-app-root">
      {/* Background Ambience & Grid */}
      <div className="hud-skyline-backdrop" />
      <div className="hud-grid-overlay" />

      {/* 1. Top System Bar */}
      <TopSystemBar
        backendOnline={backendOnline}
        backendData={backendData}
        healthData={healthData}
        aiState={aiState}
        onOpenSettings={() => setActiveView('settings')}
      />

      {/* 2. Main Body Viewport */}
      <div className="hud-body-viewport">
        {/* Left Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={(v) => setActiveView(v)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Central Workspace Viewport */}
        {activeView === 'command-center' && (
          <CommandCenterWorkspace
            aiState={aiState}
            subtitle={subtitle}
            isListening={voice.isListening}
            isSpeaking={voice.isSpeaking}
            voiceSupported={voice.voiceSupported}
            audioLevel={voice.audioLevel}
            interimTranscript={voice.interimTranscript}
            backendOnline={backendOnline}
            backendData={backendData}
            healthData={healthData}
            systemMetrics={systemMetrics}
            logs={logs}
            chatMessages={chatMessages}
            isLoadingChat={isLoadingChat}
            onSendMessage={(text) => handleSendMessage(text, true)}
            onToggleVoice={voice.toggleListening}
            onStopSpeaking={voice.stopSpeaking}
            onNavigate={(v) => setActiveView(v)}
          />
        )}

        {activeView === 'dev-studio' && <DevStudioWorkspace />}
        {activeView === 'projects' && <ProjectManagerWorkspace />}
        {activeView === 'mac-control' && <MacControlWorkspace backendData={backendData} />}
        {activeView === 'phone-hub' && <PhoneHubWorkspace />}
        {activeView === 'automation' && <AutomationCenterWorkspace />}
        {activeView === 'security' && <SecurityCenterWorkspace />}
        {activeView === 'memory' && <MemoryCenterWorkspace />}
        {activeView === 'settings' && (
          <SettingsWorkspace
            backendData={backendData}
            speechRate={voice.speechRate}
            speechPitch={voice.speechPitch}
            availableVoices={voice.availableVoices}
            selectedVoice={voice.selectedVoice}
            onRateChange={voice.setSpeechRate}
            onPitchChange={voice.setSpeechPitch}
            onVoiceChange={voice.setSelectedVoice}
            onClearHistory={handleClearHistory}
          />
        )}
      </div>
    </div>
  );
}
