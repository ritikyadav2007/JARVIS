import { useState, useEffect, useCallback } from 'react';
import {
  sendChatMessage,
  ChatError,
  fetchStatus,
  fetchHealth,
  fetchSystemMetrics,
} from './api';
import {
  AIState,
  ActiveView,
  BackendStatus,
  HealthStatus,
  LogEntry,
  SystemMetrics,
} from './types';
import { useVoice } from './hooks/useVoice';

// 5 Main Hybrid Layout Areas
import { TopSystemBar } from './components/TopSystemBar';
import { Sidebar } from './components/Sidebar';
import { SystemIntelligencePanel } from './components/SystemIntelligencePanel';
import { BottomTaskWorkspace } from './components/BottomTaskWorkspace';

// 11 Modular Workspaces
import { CommandCenterView } from './components/CommandCenterView';
import { ChatView } from './components/ChatView';
import { VoiceControlView } from './components/VoiceControlView';
import { DevStudioView } from './components/DevStudioView';
import { ProjectManagerView } from './components/ProjectManagerView';
import { MacControlView } from './components/MacControlView';
import { PhoneHubView } from './components/PhoneHubView';
import { AutomationCenterView } from './components/AutomationCenterView';
import { MemoryCenterView } from './components/MemoryCenterView';
import { SecurityCenterView } from './components/SecurityCenterView';
import { SettingsView } from './components/SettingsView';

export default function App() {
  // Navigation & View State
  const [activeView, setActiveView] = useState<ActiveView>('command-center');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // AI Pipeline & Session State
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [previousInteractionId, setPreviousInteractionId] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);

  // Subtitle / Telemetry readout
  const [currentSubtitle, setCurrentSubtitle] = useState<string>(
    'All systems operational, Sir. Standing by for directives.'
  );
  const [currentTaskTitle, setCurrentTaskTitle] = useState<string>(
    'Command HUD Standby // Neural inference pipeline active'
  );

  // System Execution Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'init-1',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'system',
      message: 'JARVIS Hybrid Command Center v2.3 online. Telemetry stream connected.',
    },
    {
      id: 'init-2',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'system',
      message: 'Gemini 3.5 Flash Interactions API handshake verified.',
    },
  ]);

  // Backend Live Telemetry
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [backendData, setBackendData] = useState<BackendStatus | null>(null);
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);

  // Chat input text state for ChatView
  const [chatInputText, setChatInputText] = useState<string>('');

  // Voice Interaction Hook with Interim Transcripts & Web Audio Analyser
  const voice = useVoice({
    onTranscript: (transcript) => {
      if (transcript.trim() && !isLoading) {
        executeSendMessage(transcript.trim(), true);
      }
    },
  });

  // Dynamic AI State Calculation matching user specification
  const computeAIState = (): AIState => {
    if (hasError) return 'error';
    if (voice.isSpeaking) return 'speaking';
    if (isLoading) return 'processing';
    if (voice.isListening) return 'listening';
    return 'ready';
  };

  const aiState = computeAIState();

  // Poll backend health and status periodically
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
    refreshTelemetry();
    const interval = setInterval(refreshTelemetry, 8000);
    return () => clearInterval(interval);
  }, [refreshTelemetry]);

  // Client-Side Allowlist for Safe MacBook Computer Queries
  const checkClientControlAllowlist = (msg: string): string | null => {
    const lower = msg.toLowerCase().trim();
    if (lower === 'time' || lower === 'what time is it' || lower === "what's the time") {
      const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      return `The current local time is ${now}.`;
    }
    if (lower === 'date' || lower === "what's today's date" || lower === "what is the date" || lower === "today's date") {
      const today = new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      return `Today is ${today}.`;
    }
    return null;
  };

  // Unified Message Execution Engine
  const executeSendMessage = async (messageText: string, autoVocalize: boolean = false) => {
    const trimmed = messageText.trim();
    if (!trimmed || isLoading) return;

    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // Append user query to log
    setLogs((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        time: timeStr,
        type: 'user',
        message: trimmed,
      },
    ]);

    setIsLoading(true);
    setHasError(false);
    setCurrentSubtitle(`"${trimmed}"`);
    setCurrentTaskTitle(`Processing directive: "${trimmed.slice(0, 38)}..."`);

    // 1. Check client-side safe allowlist
    const clientResponse = checkClientControlAllowlist(trimmed);
    if (clientResponse) {
      setCurrentSubtitle(clientResponse);
      setLogs((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'assistant',
          message: clientResponse,
        },
      ]);
      if (autoVocalize && voice.speechSupported) {
        voice.speakText(clientResponse);
      }
      setIsLoading(false);
      setCurrentTaskTitle('Standing by for user directives');
      return;
    }

    // 2. Transmit to backend Gemini AI with Local SQLite Memory & Multi-Turn Persistence
    try {
      const result = await sendChatMessage(
        trimmed,
        previousInteractionId ?? undefined,
        conversationId ?? undefined
      );

      setCurrentSubtitle(result.reply);
      setCurrentTaskTitle('Inference complete. Response received.');

      // Update multi-turn interaction & conversation IDs
      if (result.interaction_id) {
        setPreviousInteractionId(result.interaction_id);
      }
      if (result.conversation_id) {
        setConversationId(result.conversation_id);
      }

      // Append assistant response to logs
      setLogs((prev) => [
        ...prev,
        {
          id: `asst-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'assistant',
          message: result.reply,
        },
      ]);

      // Vocalize AI response
      if (autoVocalize && voice.speechSupported) {
        voice.speakText(result.reply);
      }

      // Refresh memory telemetry in case new memories were referenced
      refreshTelemetry();
    } catch (err: any) {
      setHasError(true);
      const friendlyMsg =
        err instanceof ChatError
          ? `JARVIS Notice (${err.status || 'Network'}): ${err.message}`
          : 'Unable to communicate with the core AI service.';

      setCurrentSubtitle(friendlyMsg);
      setCurrentTaskTitle('Alert: Response timeout or connection drop.');

      setLogs((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          type: 'warning',
          message: friendlyMsg,
        },
      ]);

      if (autoVocalize && voice.speechSupported) {
        voice.speakText('Unable to complete request, Sir.');
      }

      setTimeout(() => setHasError(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hybrid-app-layout">
      {/* A. Top System Bar */}
      <TopSystemBar
        backendOnline={backendOnline}
        backendData={backendData}
        healthData={healthData}
        aiState={aiState}
        onOpenSettings={() => setActiveView('settings')}
        onOpenSecurity={() => setActiveView('security')}
      />

      {/* Middle Hybrid Grid (Left Sidebar + Center Workspaces + Right Intelligence) */}
      <div className="hybrid-main-container">
        {/* B. Left Navigation Sidebar */}
        <Sidebar
          activeView={activeView}
          onSelectView={(v) => setActiveView(v)}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          backendOnline={backendOnline}
          memoriesCount={backendData?.memories_count}
          activeTasksCount={isLoading ? 1 : 0}
        />

        {/* C. Central Workspace Viewport */}
        <main className="hybrid-workspace-viewport">
          {(activeView === 'command-center' || activeView === 'home') && (
            <CommandCenterView
              aiState={aiState}
              subtitle={currentSubtitle}
              isListening={voice.isListening}
              isSpeaking={voice.isSpeaking}
              voiceSupported={voice.voiceSupported}
              audioLevel={voice.audioLevel}
              interimTranscript={voice.interimTranscript}
              backendOnline={backendOnline}
              backendData={backendData}
              systemMetrics={systemMetrics}
              logs={logs}
              onToggleVoice={voice.toggleListening}
              onStopSpeaking={voice.stopSpeaking}
              onSendTextMessage={(text) => executeSendMessage(text, true)}
              onSwitchView={(v) => setActiveView(v)}
            />
          )}

          {(activeView === 'chat' || activeView === 'conversations') && (
            <ChatView
              logs={logs}
              inputText={chatInputText}
              setInputText={setChatInputText}
              onSendMessage={(e) => {
                if (e) e.preventDefault();
                if (chatInputText.trim()) {
                  const q = chatInputText.trim();
                  setChatInputText('');
                  executeSendMessage(q, true);
                }
              }}
              isLoading={isLoading}
              isListening={voice.isListening}
              onToggleVoice={voice.toggleListening}
              onSpeakText={voice.speakText}
              isSpeaking={voice.isSpeaking}
              onStopSpeaking={voice.stopSpeaking}
              conversationId={conversationId}
              onClearConversation={() => setLogs([])}
            />
          )}

          {activeView === 'voice' && (
            <VoiceControlView
              isListening={voice.isListening}
              isSpeaking={voice.isSpeaking}
              voiceSupported={voice.voiceSupported}
              speechSupported={voice.speechSupported}
              permissionError={voice.permissionError}
              onToggleVoice={voice.toggleListening}
              onCancelListening={voice.cancelListening}
              onStopSpeaking={voice.stopSpeaking}
              onTestSpeech={voice.speakText}
              availableVoices={voice.availableVoices}
              selectedVoice={voice.selectedVoice}
              onSelectVoice={voice.setSelectedVoice}
              speechRate={voice.speechRate}
              onRateChange={voice.setSpeechRate}
              speechPitch={voice.speechPitch}
              onPitchChange={voice.setSpeechPitch}
            />
          )}

          {(activeView === 'dev-studio' || activeView === 'tools') && <DevStudioView />}

          {activeView === 'projects' && <ProjectManagerView />}

          {activeView === 'mac-control' && <MacControlView backendData={backendData} />}

          {activeView === 'phone-hub' && <PhoneHubView />}

          {activeView === 'automation' && <AutomationCenterView />}

          {activeView === 'memory' && <MemoryCenterView />}

          {activeView === 'security' && <SecurityCenterView />}

          {activeView === 'settings' && (
            <SettingsView
              backendData={backendData}
              healthData={healthData}
              backendOnline={backendOnline}
              onSelectView={(v) => setActiveView(v)}
              availableVoices={voice.availableVoices}
              selectedVoice={voice.selectedVoice}
              onSelectVoice={voice.setSelectedVoice}
              speechRate={voice.speechRate}
              onRateChange={voice.setSpeechRate}
              speechPitch={voice.speechPitch}
              onPitchChange={voice.setSpeechPitch}
              voiceSupported={voice.voiceSupported}
              speechSupported={voice.speechSupported}
            />
          )}
        </main>

        {/* D. Right System Intelligence Panel (Active on utility workspaces) */}
        {activeView !== 'command-center' && activeView !== 'home' && (
          <SystemIntelligencePanel
            backendOnline={backendOnline}
            backendData={backendData}
            healthData={healthData}
            systemMetrics={systemMetrics}
            onOpenPhoneHub={() => setActiveView('phone-hub')}
            onOpenMacControl={() => setActiveView('mac-control')}
          />
        )}
      </div>

      {/* E. Bottom Task Workspace */}
      <BottomTaskWorkspace
        logs={logs}
        currentTaskTitle={currentTaskTitle}
        isProcessing={isLoading}
        onClearLogs={() => setLogs([])}
      />
    </div>
  );
}
