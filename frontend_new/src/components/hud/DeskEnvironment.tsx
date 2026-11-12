import React from 'react';

export const DeskEnvironment: React.FC = () => {
  return (
    <div className="hud-desk-environment" aria-hidden="true">
      <div className="desk-reflection-overlay" />

      {/* 1. Tux Penguin Mascot on the Left Desk */}
      <div className="desk-item desk-tux" title="Linux & macOS Kernel Engine">
        <svg width="42" height="52" viewBox="0 0 60 70" fill="none">
          <ellipse cx="30" cy="40" rx="18" ry="24" fill="#0f172a" />
          <ellipse cx="30" cy="42" rx="13" ry="19" fill="#f8fafc" />
          <circle cx="30" cy="20" r="14" fill="#0f172a" />
          <ellipse cx="25" cy="18" rx="2.5" ry="3.5" fill="#f8fafc" />
          <ellipse cx="35" cy="18" rx="2.5" ry="3.5" fill="#f8fafc" />
          <circle cx="26" cy="19" r="1.5" fill="#020617" />
          <circle cx="36" cy="19" r="1.5" fill="#020617" />
          <path d="M 25 23 Q 30 29 35 23 Q 30 20 25 23 Z" fill="#f59e0b" />
          <ellipse cx="18" cy="62" rx="8" ry="3.5" fill="#f59e0b" />
          <ellipse cx="42" cy="62" rx="8" ry="3.5" fill="#f59e0b" />
          {/* Wings */}
          <path d="M 12 30 Q 8 45 15 55 Q 16 42 16 35 Z" fill="#0f172a" />
          <path d="M 48 30 Q 52 45 45 55 Q 44 42 44 35 Z" fill="#0f172a" />
        </svg>
      </div>

      {/* 2. Illuminated Mechanical Keyboard in Center-Left */}
      <div className="desk-item desk-keyboard" title="Mechanical Workstation Keyboard">
        <div className="keyboard-row">
          <span className="keyboard-key lit" />
          <span className="keyboard-key" />
          <span className="keyboard-key lit" />
          <span className="keyboard-key" />
          <span className="keyboard-key" />
          <span className="keyboard-key lit" />
          <span className="keyboard-key" />
          <span className="keyboard-key" />
          <span className="keyboard-key lit" />
          <span className="keyboard-key" />
          <span className="keyboard-key" />
          <span className="keyboard-key lit" />
        </div>
        <div className="keyboard-row">
          <span className="keyboard-key" />
          <span className="keyboard-key lit" />
          <span className="keyboard-key" />
          <span className="keyboard-key" />
          <span className="keyboard-key lit" />
          <span className="keyboard-key" />
          <span className="keyboard-key lit" />
          <span className="keyboard-key" />
          <span className="keyboard-key" />
          <span className="keyboard-key lit" />
          <span className="keyboard-key" />
          <span className="keyboard-key" />
        </div>
        <div className="keyboard-row">
          <span className="keyboard-key lit" />
          <span className="keyboard-key" />
          <span className="keyboard-key" />
          <span className="keyboard-key lit" style={{ flex: 3 }} />
          <span className="keyboard-key" />
          <span className="keyboard-key lit" />
          <span className="keyboard-key" />
        </div>
      </div>

      {/* 3. Ergonomic Gaming Mouse in Center-Right */}
      <div className="desk-item desk-mouse" title="Tactical Optical Mouse">
        <span className="mouse-wheel" />
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2" style={{ marginTop: '10px' }}>
          <polygon points="12 2 15 8 22 9 17 14 18 21 12 17 6 21 7 14 2 9 9 8 12 2" />
        </svg>
      </div>

      {/* 4. Ceramic Coffee Mug on the Right Desk */}
      <div className="desk-item desk-coffee-mug" title="#1/b coff">
        <div className="mug-body">
          <span>#1/b</span>
          <span>coff</span>
        </div>
        <div className="mug-handle" />
      </div>
    </div>
  );
};

