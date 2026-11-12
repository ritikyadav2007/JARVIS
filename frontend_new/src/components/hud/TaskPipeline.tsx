import React from 'react';
import type { AIState } from '../../types';

interface TaskPipelineProps {
  aiState: AIState;
  currentTaskTitle?: string;
}

export const TaskPipeline: React.FC<TaskPipelineProps> = ({
  aiState,
}) => {
  const getStageStatus = (stageNum: number): 'idle' | 'active' | 'completed' => {
    switch (stageNum) {
      case 1:
        if (aiState === 'listening') return 'active';
        if (aiState === 'processing' || aiState === 'thinking' || aiState === 'speaking' || aiState === 'ready' || aiState === 'idle') return 'completed';
        return 'idle';
      case 2:
        if (aiState === 'thinking') return 'active';
        if (aiState === 'processing' || aiState === 'speaking' || aiState === 'ready' || aiState === 'idle') return 'completed';
        return 'idle';
      case 3:
        if (aiState === 'processing') return 'active';
        if (aiState === 'speaking' || aiState === 'ready' || aiState === 'idle') return 'completed';
        return 'idle';
      case 4:
        if (aiState === 'speaking') return 'active';
        if (aiState === 'ready' || aiState === 'idle') return 'completed';
        return 'idle';
      case 5:
        if (aiState === 'completed' || aiState === 'ready' || aiState === 'idle') return 'completed';
        return 'idle';
      default:
        return 'idle';
    }
  };

  const stages = [
    {
      id: 1,
      num: '01',
      title: 'INTAKE',
      sub: 'Receive Input',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M17 5v14M7 8v8M2 11v2M22 11v2" />
        </svg>
      ),
    },
    {
      id: 2,
      num: '02',
      title: 'REASON',
      sub: 'Plan Strategy',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" />
        </svg>
      ),
    },
    {
      id: 3,
      num: '03',
      title: 'SYNTHESIZE',
      sub: 'Generate Response',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
    {
      id: 4,
      num: '04',
      title: 'DISPATCH',
      sub: 'Speak & Execute',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
        </svg>
      ),
    },
    {
      id: 5,
      num: '05',
      title: 'VERIFY',
      sub: 'Confirm & Log',
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
    },
  ];

  return (
    <div className="hud-task-pipeline-bar" aria-label="Task Execution Pipeline">
      <div className="pipeline-5-steps">
        {stages.map((st) => {
          const status = getStageStatus(st.id);
          return (
            <div
              key={st.id}
              className={`pipeline-chevron-step ${status}`}
              title={`${st.num}. ${st.title} — ${st.sub}`}
            >
              <div className="step-icon-wrap">{st.icon}</div>
              <div className="step-text-col">
                <span className="step-title-row">
                  {st.num}. {st.title}
                </span>
                <span className="step-desc-row">{st.sub}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
