import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import LogInteraction from './components/LogInteraction';
import Dashboard from './components/Dashboard';
import HCPDirectory from './components/HCPDirectory';
import FollowUps from './components/FollowUps';
import Settings from './components/Settings';

function App() {
  const [activeView, setActiveView] = useState(() => {
    return localStorage.getItem('activeView') || 'dashboard';
  });

  const handleSetView = (view) => {
    setActiveView(view);
    localStorage.setItem('activeView', view);
  };

  const renderView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard />;
      case 'hcp_directory':
        return <HCPDirectory />;
      case 'log_interaction':
        return <LogInteraction />;
      case 'follow_ups':
        return <FollowUps />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Sidebar activeView={activeView} setActiveView={handleSetView} />
      <div className="main-content">
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {renderView()}
        </div>
      </div>
    </div>
  );
}

export default App;
