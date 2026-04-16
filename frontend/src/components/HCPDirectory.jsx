import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHCPs } from '../store/crmSlice';
import { UserCircle, Mail, Briefcase } from 'lucide-react';

const HCPDirectory = () => {
  const dispatch = useDispatch();
  const hcps = useSelector(state => state.crm.hcps);
  const status = useSelector(state => state.crm.status);

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchHCPs());
    }
  }, [dispatch, status]);

  return (
    <div className="animate-fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.5rem' }}>HCP Directory</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Manage your Healthcare Professional contacts network.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {hcps.map(hcp => (
          <div key={hcp.id} className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <UserCircle size={48} color="var(--primary-color)" />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: 'var(--text-main)' }}>{hcp.name}</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--primary-color)', background: '#eff6ff', padding: '0.2rem 0.6rem', borderRadius: '1rem', fontWeight: '500' }}>{hcp.specialty}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={16} />
                {hcp.contact_info || 'No email provided'}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Briefcase size={16} />
                ID: {hcp.id}
              </div>
            </div>
          </div>
        ))}
        {hcps.length === 0 && status !== 'loading' && (
          <p style={{ color: 'var(--text-muted)' }}>No HCPs found in the directory.</p>
        )}
      </div>
    </div>
  );
};

export default HCPDirectory;
