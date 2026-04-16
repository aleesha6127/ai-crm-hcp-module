import React from 'react';

const Settings = () => {
  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Settings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configure your AI CRM preferences.</p>
      
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1rem' }}>General Settings</h3>
        <p style={{ color: 'var(--text-muted)' }}>Settings options are currently under development. This section will allow you to manage user preferences, notification settings, and integrations.</p>
      </div>
    </div>
  );
};

export default Settings;
