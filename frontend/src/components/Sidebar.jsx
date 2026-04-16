import React from 'react';
import { LayoutDashboard, Users, MessageSquareText, CalendarDays, Settings } from 'lucide-react';

const Sidebar = ({ activeView, setActiveView }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hcp_directory', label: 'HCP Directory', icon: Users },
    { id: 'log_interaction', label: 'Log Interaction', icon: MessageSquareText },
    { id: 'follow_ups', label: 'Follow-ups', icon: CalendarDays },
  ];

  return (
    <div className="sidebar">
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ background: 'var(--primary-color)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem' }}>
          <MessageSquareText size={24} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>AI CRM</h2>
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <div 
              key={item.id}
              onClick={() => setActiveView(item.id)}
              style={{ 
                display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
                background: isActive ? '#eff6ff' : 'transparent',
                color: isActive ? 'var(--primary-hover)' : 'var(--text-muted)',
                fontWeight: isActive ? '600' : '500'
              }}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <div 
          onClick={() => setActiveView('settings')}
          style={{ 
            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer',
            background: activeView === 'settings' ? '#eff6ff' : 'transparent',
            color: activeView === 'settings' ? 'var(--primary-hover)' : 'var(--text-muted)',
            fontWeight: activeView === 'settings' ? '600' : '500'
          }}
        >
          <Settings size={20} />
          <span>Settings</span>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
