import React, { useState } from 'react';

export const AutomationCenterView: React.FC = () => {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const workflows = [
    {
      id: 'wf-health',
      name: 'Morning System Telemetry & Health Audit',
      trigger: 'Scheduled (Daily at 08:00)',
      status: 'Ready',
      steps: ['Ping FastAPI Backend', 'Check SQLite Database Integrity', 'Verify Gemini API Latency', 'Vocalize Briefing'],
    },
    {
      id: 'wf-backup',
      name: 'Local SQLite Memory Vault Snapshot',
      trigger: 'On Memory Creation',
      status: 'Active',
      steps: ['Export jarvis.db tables', 'Verify WAL checkpoint', 'Generate local JSON snapshot'],
    },
    {
      id: 'wf-git',
      name: 'Workspace Code Integrity & TypeScript Verification',
      trigger: 'Pre-Commit / Manual',
      status: 'Ready',
      steps: ['Run tsc --noEmit', 'Run backend py_compile', 'Log verification status'],
    },
    {
      id: 'wf-research',
      name: 'Autonomous Research & Summarization Agent',
      trigger: 'Voice / Prompt Event',
      status: 'Ready',
      steps: ['Retrieve query keywords', 'Query Gemini with Search Grounding', 'Format synthesis response'],
    },
  ];

  const pendingApprovals = [
    {
      id: 'appr-1',
      action: 'Execute macOS Terminal command in project workspace',
      risk: 'Low',
      source: 'Automation Scheduler',
      time: '5 mins ago',
    },
    {
      id: 'appr-2',
      action: 'Install local Python package into backend/.venv',
      risk: 'Medium',
      source: 'Dev Studio Agent',
      time: '12 mins ago',
    },
  ];

  const handleRunWorkflow = (id: string, name: string) => {
    setActiveWorkflow(id);
    setActionNotice(`Executing workflow: "${name}"... Step 1 of 4 running.`);
    setTimeout(() => {
      setActionNotice(`✓ Completed workflow: "${name}". All pipeline stages verified.`);
      setActiveWorkflow(null);
    }, 3000);
  };

  return (
    <div className="jarvis-card automation-center-card">
      <div className="card-header">
        <div>
          <h3 className="card-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            AUTONOMOUS WORKFLOW & TASK AUTOMATION CENTER
          </h3>
          <p className="card-subtitle">
            Autonomous multi-step workflows, planned background tasks, and safety approval gates.
          </p>
        </div>
      </div>

      {actionNotice && (
        <div className="hud-feedback-alert">
          <span>{actionNotice}</span>
        </div>
      )}

      <div className="automation-layout-grid">
        {/* Left: Workflows List */}
        <div className="workflows-column">
          <h4 className="section-title">CONFIGURED WORKFLOW PIPELINES</h4>
          <div className="workflows-list">
            {workflows.map((wf) => (
              <div key={wf.id} className="workflow-item-card">
                <div className="wf-card-top">
                  <div>
                    <span className="wf-name">{wf.name}</span>
                    <span className="wf-trigger">Trigger: {wf.trigger}</span>
                  </div>
                  <span className={`status-tag ${wf.status === 'Active' ? 'tag-ready' : 'tag-subtle'}`}>
                    {wf.status}
                  </span>
                </div>

                <div className="wf-steps-preview">
                  <span className="steps-title">EXECUTION PIPELINE:</span>
                  <div className="steps-chips">
                    {wf.steps.map((st, i) => (
                      <span key={i} className="step-chip">
                        {i + 1}. {st}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="wf-actions-strip">
                  <button
                    className="hud-button hud-button-cyan"
                    onClick={() => handleRunWorkflow(wf.id, wf.name)}
                    disabled={activeWorkflow === wf.id}
                  >
                    {activeWorkflow === wf.id ? 'Running Pipeline...' : 'Trigger Workflow'}
                  </button>
                  <button className="hud-button-subtle">Edit Rules</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Pending Approvals & History */}
        <div className="approvals-column">
          <div className="approvals-box">
            <h4 className="section-title">SECURITY APPROVAL REQUESTS (2 PENDING)</h4>
            <div className="approvals-list">
              {pendingApprovals.map((appr) => (
                <div key={appr.id} className="approval-item-card">
                  <div className="appr-top">
                    <span className={`risk-badge risk-${appr.risk.toLowerCase()}`}>
                      {appr.risk} Risk
                    </span>
                    <span className="appr-time text-dim">{appr.time}</span>
                  </div>
                  <p className="appr-desc">{appr.action}</p>
                  <span className="appr-source text-dim">Source: {appr.source}</span>
                  <div className="appr-buttons">
                    <button
                      className="hud-button-small hud-button-emerald"
                      onClick={() => setActionNotice(`Authorized action: ${appr.action}`)}
                    >
                      Authorize
                    </button>
                    <button
                      className="hud-button-small hud-button-warn"
                      onClick={() => setActionNotice(`Denied action: ${appr.action}`)}
                    >
                      Deny
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="history-box">
            <h4 className="section-title">RECENT AUTOMATION LOGS</h4>
            <div className="auto-log-entries">
              <div className="auto-log-row">
                <span className="text-emerald">✓</span>
                <span className="log-txt">SQLite integrity check passed</span>
                <span className="log-t">14:15:02</span>
              </div>
              <div className="auto-log-row">
                <span className="text-cyan">✓</span>
                <span className="log-txt">Gemini model set to gemini-3.5-flash</span>
                <span className="log-t">13:49:12</span>
              </div>
              <div className="auto-log-row">
                <span className="text-emerald">✓</span>
                <span className="log-txt">Vite dev server restarted</span>
                <span className="log-t">12:30:45</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
