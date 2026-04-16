import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInteractions, fetchHCPs } from '../store/crmSlice';
import { Users, FileText, CheckCircle } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();
  const hcps = useSelector(state => state.crm.hcps);
  const interactions = useSelector(state => state.crm.interactions);
  const error = useSelector(state => state.crm.error);

  useEffect(() => {
    dispatch(fetchHCPs());
    dispatch(fetchInteractions());
  }, [dispatch]);

  const totalHCPs = hcps.length;
  const totalInteractions = interactions.length;
  
  // Calculate total pending follow-ups
  const pendingFollowUps = interactions.reduce((total, interaction) => {
    const pending = interaction.follow_ups?.filter(fu => fu.status === "Pending").length || 0;
    return total + pending;
  }, 0);

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Dashboard</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Overview of your recent activities and metrics.</p>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem', border: '1px solid #fecaca' }}>
          <strong>Connection Error:</strong> {error}. 
          Make sure the backend is running on http://localhost:8000
        </div>
      )}


      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: '#dbeafe', color: '#2563eb', padding: '1rem', borderRadius: '50%' }}>
            <Users size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Total HCPs</p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>{totalHCPs}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: '#dcfce7', color: '#16a34a', padding: '1rem', borderRadius: '50%' }}>
            <FileText size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Total Interactions</p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>{totalInteractions}</h2>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.5rem' }}>
          <div style={{ background: '#fef3c7', color: '#d97706', padding: '1rem', borderRadius: '50%' }}>
            <CheckCircle size={28} />
          </div>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: '500' }}>Pending Tasks</p>
            <h2 style={{ fontSize: '1.75rem', fontWeight: '700' }}>{pendingFollowUps}</h2>
          </div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Interactions</h3>
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {interactions.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Date</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>HCP</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Type</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Sentiment</th>
              </tr>
            </thead>
            <tbody>
              {interactions.slice(0, 5).map((interaction, idx) => {
                const hcp = hcps.find(h => h.id === interaction.hcp_id);
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '1rem 1.5rem' }}>{new Date(interaction.date_time).toLocaleDateString()}</td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{hcp ? hcp.name : `ID: ${interaction.hcp_id}`}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{interaction.type}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.75rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        background: interaction.sentiment === 'Positive' ? '#dcfce7' : interaction.sentiment === 'Negative' ? '#fee2e2' : '#f1f5f9',
                        color: interaction.sentiment === 'Positive' ? '#166534' : interaction.sentiment === 'Negative' ? '#991b1b' : '#334155'
                      }}>
                        {interaction.sentiment}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No interactions logged yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
