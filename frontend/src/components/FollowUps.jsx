import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchInteractions, fetchHCPs, updateFollowUpStatus } from '../store/crmSlice';
import { CalendarClock, CheckCircle, Clock } from 'lucide-react';

const FollowUps = () => {
  const dispatch = useDispatch();
  const interactions = useSelector(state => state.crm.interactions);
  const hcps = useSelector(state => state.crm.hcps);
  
  const intStatus = useSelector(state => state.crm.intStatus);

  useEffect(() => {
    if (intStatus === 'idle') {
      dispatch(fetchInteractions());
      dispatch(fetchHCPs());
    }
  }, [dispatch, intStatus]);

  const handleToggleStatus = (fuId, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Completed' : 'Pending';
    dispatch(updateFollowUpStatus({ followUpId: fuId, status: newStatus }))
      .then(() => dispatch(fetchInteractions())); // Refresh to get latest state
  };


  // Extract all follow-ups from nested interactions
  const allFollowUps = [];
  interactions.forEach(interaction => {
    if (interaction.follow_ups && interaction.follow_ups.length > 0) {
      interaction.follow_ups.forEach(fu => {
        allFollowUps.push({
          ...fu,
          hcp_id: interaction.hcp_id,
          interaction_type: interaction.type
        });
      });
    }
  });

  // Sort by date prioritizing pending tasks
  allFollowUps.sort((a, b) => {
    if (a.status !== b.status) {
      return a.status === 'Pending' ? -1 : 1;
    }
    return new Date(a.due_date || 0) - new Date(b.due_date || 0);
  });

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Follow-ups</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Track and manage your scheduled interaction tasks.</p>
      
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        {allFollowUps.length > 0 ? (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)' }}>
              <tr>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Task</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Due Date</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: '600', color: 'var(--text-muted)' }}>Related HCP</th>
              </tr>
            </thead>
            <tbody>
              {allFollowUps.map((fu, idx) => {
                const hcp = hcps.find(h => h.id === fu.hcp_id);
                const isPending = fu.status === 'Pending';
                
                return (
                  <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)', background: isPending ? 'transparent' : '#f8fafc' }}>
                    <td 
                      style={{ padding: '1rem 1.5rem', cursor: 'pointer' }}
                      onClick={() => handleToggleStatus(fu.id, fu.status)}
                      title={`Mark as ${fu.status === 'Pending' ? 'Completed' : 'Pending'}`}
                    >
                      {isPending ? <Clock color="#f59e0b" size={20} /> : <CheckCircle color="#16a34a" size={20} />}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500', color: isPending ? 'inherit' : 'var(--text-muted)', textDecoration: isPending ? 'none' : 'line-through' }}>
                      {fu.description}
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: isPending ? 'var(--text-main)' : 'var(--text-muted)' }}>
                      {fu.due_date ? new Date(fu.due_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <span style={{ fontWeight: '500' }}>{hcp ? hcp.name : `ID: ${fu.hcp_id}`}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <CalendarClock size={48} color="var(--border-color)" />
            <p style={{ color: 'var(--text-muted)' }}>No follow-up tasks discovered.</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Log an interaction or use the AI to suggest follow-ups!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowUps;
