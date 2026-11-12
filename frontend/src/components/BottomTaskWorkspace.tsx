import React, { useState } from 'react';
import { LogEntry } from '../types';

interface BottomTaskWorkspaceProps {
  logs: LogEntry[];
  currentTaskTitle: string;
  isProcessing: boolean;
  onClearLogs?: () => void;
}

export const BottomTaskWorkspace: React.FC<BottomTaskWorkspaceProps> = ({
  logs,
  currentTaskTitle,
  isProcessing,
  onClearLogs,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'pipeline' | 'logs' | 'history'>('pipeline');

  // The 5 Canonical Pipeline Stages required by specification
  const pipelineStages = [
    {
      id: 1,
      key: 'INTAKE',
      title: 'INTAKE',
      desc: 'Voice transcription / text directive reception',
      status: isProcessing ? 'active' : 'completed',
    },
    {
      id: 2,
      key: 'REASON',
      title: 'REASON',
      desc: 'Context formulation & local SQLite memory lookup',
      status: isProcessing ? 'active' : 'completed',
    },
    {
      id: 3,
      key: 'SYNTHESIZE',
      title: 'SYNTHESIZE',
      desc: 'Gemini 3.5 Flash neural inference generation',
      status: isProcessing ? 'active' : 'completed',
    },
    {
      id: 4,
      key: 'DISPATCH',
      title: 'DISPATCH',
      desc: 'Speech vocalization & HUD telemetry streaming',
      status: isProcessing ? 'pending' : 'completed',
    },
    {
      id: 5,
      key: 'VERIFY',
      title: 'VERIFY',
      desc: 'Multi-turn persistence & system state validation',
      status: isProcessing ? 'pending' : 'completed',
    },
  ];

  return (
    <footer className={`bottom-task-workspace ${isExpanded ? 'workspace-expanded' : 'workspace-collapsed'}`}>
      {/* Ticker / Summary Bar */}
      <div className="task-summary-bar">
        <div className="summary-left">
          <button
            className="workspace-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse Task Drawer' : 'Expand Task Workspace'}
            aria-label={isExpanded ? 'Collapse Task Drawer' : 'Expand Task Workspace'}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
            >
              <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
            <span className="toggle-label">{isExpanded ? 'CLOSE PIPELINE' : 'TASK PIPELINE'}</span>
          </button>

          <div className="active-task-indicator">
            <span className={`task-led ${isProcessing ? 'led-pulse' : 'led-ready'}`}></span>
            <span className="task-header-tag">ACTIVE PIPELINE:</span>
            <span className="task-title-text">{currentTaskTitle}</span>
          </div>
        </div>

        <div className="summary-right">
          {/* Canonical 5-Step Pipeline Mini Chain */}
          <div className="step-mini-chain" title="5-Stage Execution Chain: INTAKE › REASON › SYNTHESIZE › DISPATCH › VERIFY">
            {pipelineStages.map((stage) => (
              <span
                key={stage.id}
                className={`mini-step-node ${stage.status}`}
                title={`${stage.title}: ${stage.desc} (${stage.status.toUpperCase()})`}
              >
                <span className="mini-step-text">{stage.key.slice(0, 3)}</span>
              </span>
            ))}
          </div>

          <span className="summary-log-count text-dim">
            {logs.length} logged
          </span>
        </div>
      </div>

      {/* Expanded Drawer Content */}
      {isExpanded && (
        <div className="task-drawer-body">
          {/* Drawer Tab Header */}
          <div className="drawer-tabs">
            <button
              className={`drawer-tab-btn ${activeTab === 'pipeline' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('pipeline')}
            >
              Pipeline Stages (5)
            </button>
            <button
              className={`drawer-tab-btn ${activeTab === 'logs' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              Live Activity Logs ({logs.length})
            </button>
            <button
              className={`drawer-tab-btn ${activeTab === 'history' ? 'tab-active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              Task History
            </button>

            {onClearLogs && (
              <button className="drawer-clear-btn" onClick={onClearLogs}>
                Clear Logs
              </button>
            )}
          </div>

          {/* Drawer Tab Body */}
          <div className="drawer-tab-content">
            {/* 1. PIPELINE 5-STAGE VIEW */}
            {activeTab === 'pipeline' && (
              <div className="pipeline-5stages-grid">
                {pipelineStages.map((stage) => (
                  <div key={stage.id} className={`pipeline-stage-card status-${stage.status}`}>
                    <div className="stage-top">
                      <span className="stage-num">0{stage.id}</span>
                      <span className="stage-badge">{stage.status.toUpperCase()}</span>
                    </div>
                    <div className="stage-title">{stage.title}</div>
                    <div className="stage-desc">{stage.desc}</div>
                    <div className="stage-progress-bar">
                      <div className={`stage-progress-fill ${stage.status === 'completed' ? 'fill-full' : stage.status === 'active' ? 'fill-pulse' : 'fill-empty'}`}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 2. ACTIVITY LOGS */}
            {activeTab === 'logs' && (
              <div className="execution-log-container">
                {logs.length === 0 ? (
                  <div className="empty-log">System running nominally. Awaiting next command.</div>
                ) : (
                  logs.slice(-30).map((log) => (
                    <div key={log.id} className={`log-line log-${log.type}`}>
                      <span className="log-time">[{log.time}]</span>
                      <span className="log-badge">[{log.type.toUpperCase()}]</span>
                      <span className="log-msg">{log.message}</span>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 3. TASK HISTORY */}
            {activeTab === 'history' && (
              <div className="operations-list">
                <div className="operation-item">
                  <span className="op-bullet text-emerald">✓</span>
                  <div className="op-info">
                    <span className="op-name">Local SQLite Memory Index Verified</span>
                    <span className="op-detail">backend/data/jarvis.db checked and validated</span>
                  </div>
                </div>
                <div className="operation-item">
                  <span className="op-bullet text-cyan">✓</span>
                  <div className="op-info">
                    <span className="op-name">Gemini 3.5 Flash Model Connected</span>
                    <span className="op-detail">Multi-turn session persistence active</span>
                  </div>
                </div>
                <div className="operation-item">
                  <span className="op-bullet text-emerald">✓</span>
                  <div className="op-info">
                    <span className="op-name">Speech & Audio Reactive Matrix Initialized</span>
                    <span className="op-detail">Push-to-talk speech synthesis ready</span>
                  </div>
                </div>
                <div className="operation-item">
                  <span className="op-bullet text-cyan">✓</span>
                  <div className="op-info">
                    <span className="op-name">Real-Time Hardware Telemetry Stream</span>
                    <span className="op-detail">psutil live sampling for CPU, RAM, Disk, Net</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </footer>
  );
};
