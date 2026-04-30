import React, { useState, useEffect } from 'react';
import { Save, Key, CheckCircle } from 'lucide-react';

const Settings = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('GROQ_API_KEY');
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSave = () => {
    localStorage.setItem('GROQ_API_KEY', apiKey);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Settings</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Configure your AI CRM preferences.</p>
      
      <div className="card" style={{ padding: '2rem', maxWidth: '600px' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Key size={20} color="var(--primary-color)" /> AI Configuration
        </h3>
        
        <div className="input-group" style={{ marginBottom: '1.5rem' }}>
          <label className="input-label">Groq API Key</label>
          <input 
            type="password" 
            className="form-control" 
            placeholder="gsk_..." 
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
            Your key is stored locally in your browser and used for AI data extraction and chat.
          </p>
        </div>

        <button 
          onClick={handleSave} 
          className="btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', width: 'fit-content' }}
        >
          {saved ? <CheckCircle size={18} /> : <Save size={18} />}
          {saved ? 'Key Saved!' : 'Save AI Configuration'}
        </button>
      </div>

      <div className="card" style={{ padding: '2rem', marginTop: '1.5rem', background: '#f8fafc' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>About AI Mode</h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: '1.5' }}>
          This CRM uses <strong>Groq Cloud</strong> with <strong>Gemma 70B</strong> to provide instantaneous natural language processing. 
          Without a key, the system runs in a "Demo Mode" with limited functionality.
        </p>
      </div>
    </div>
  );
};

export default Settings;
