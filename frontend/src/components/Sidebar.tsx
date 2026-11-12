import React from 'react';
import { ActiveView } from '../types';

interface SidebarProps {
  activeView: ActiveView;
  onSelectView: (view: ActiveView) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  backendOnline: boolean | null;
  memoriesCount?: number;
  activeTasksCount?: number;
}

interface NavItem {
  id: ActiveView;
  label: string;
  icon: React.ReactNode;
  badge?: string | number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  onSelectView,
  collapsed,
  onToggleCollapse,
  backendOnline,
  memoriesCount,
  activeTasksCount,
}) => {
  const navItems: NavItem[] = [
    {
      id: 'command-center',
      label: 'Command Center',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
          <polyline points="9 22 9 12 15 12 15 22"></polyline>
        </svg>
      ),
    },
    {
      id: 'chat',
      label: 'AI Chat',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      id: 'voice',
      label: 'Voice Control',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"></path>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
          <line x1="12" y1="19" x2="12" y2="22"></line>
        </svg>
      ),
    },
    {
      id: 'dev-studio',
      label: 'Development Studio',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6"></polyline>
          <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
      ),
    },
    {
      id: 'projects',
      label: 'Project Manager',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
      ),
    },
    {
      id: 'mac-control',
      label: 'Mac Control',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ),
    },
    {
      id: 'phone-hub',
      label: 'Phone Hub',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
          <line x1="12" y1="18" x2="12.01" y2="18"></line>
        </svg>
      ),
    },
    {
      id: 'automation',
      label: 'Automation Center',
      badge: activeTasksCount && activeTasksCount > 0 ? activeTasksCount : undefined,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
      ),
    },
    {
      id: 'memory',
      label: 'Memory & Knowledge',
      badge: memoriesCount !== undefined && memoriesCount > 0 ? memoriesCount : undefined,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
      ),
    },
    {
      id: 'security',
      label: 'Security Center',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      ),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
      ),
    },
  ];

  // Map legacy activeView names to canonical ones for highlight
  const canonicalActive =
    activeView === 'home'
      ? 'command-center'
      : activeView === 'conversations'
      ? 'chat'
      : activeView === 'tools'
      ? 'dev-studio'
      : activeView;

  return (
    <aside className={`jarvis-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="brand-logo">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2.2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
          </div>
          {!collapsed && (
            <div className="brand-text">
              <span className="brand-name">JARVIS</span>
              <span className="brand-sub">HYBRID OS // v2.3</span>
            </div>
          )}
        </div>

        <button
          className="collapse-toggle"
          onClick={onToggleCollapse}
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ transform: collapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="sidebar-nav">
        {navItems.map((item) => {
          const isActive = canonicalActive === item.id;
          return (
            <button
              key={item.id}
              className={`nav-button ${isActive ? 'nav-active' : ''}`}
              onClick={() => onSelectView(item.id)}
              title={collapsed ? item.label : undefined}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {!collapsed && item.badge !== undefined && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Sidebar Footer — Status indicator */}
      <div className="sidebar-footer">
        <div className="sidebar-status-pill" title={backendOnline ? 'Backend Online (Port 8000)' : 'Backend Standby'}>
          <span className={`status-dot ${backendOnline ? 'dot-online' : 'dot-standby'}`}></span>
          {!collapsed && (
            <div className="status-footer-col">
              <span className="status-text">
                {backendOnline === null ? 'SYNCING...' : backendOnline ? 'CORE ONLINE' : 'STANDBY'}
              </span>
              <span className="status-subtext">gemini-3.5-flash</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};
