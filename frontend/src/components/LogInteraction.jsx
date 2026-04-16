import React, { useState } from 'react';
import InteractionForm from './InteractionForm';
import InteractionChat from './InteractionChat';

const LogInteraction = () => {
  const [view, setView] = useState('form');

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Log Interaction</h1>
        <p style={{ color: 'var(--text-muted)' }}>Record details of your meetings, calls, and email communications with HCPs.</p>
      </div>

      <div className="toggle-group animate-fade-in">
        <button 
          className={`toggle-item ${view === 'form' ? 'active' : ''}`}
          onClick={() => setView('form')}
        >
          Structured Form
        </button>
        <button 
          className={`toggle-item ${view === 'chat' ? 'active' : ''}`}
          onClick={() => setView('chat')}
        >
          AI Chat Mode ✨
        </button>
      </div>

      {view === 'form' ? <InteractionForm /> : <InteractionChat />}
    </div>
  );
};

export default LogInteraction;
