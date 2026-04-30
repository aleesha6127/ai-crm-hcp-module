import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchHCPs, logInteractionForm, setSelectedHcpId } from '../store/crmSlice';
import { Save, Search, User, MapPin, Building2, AlertCircle } from 'lucide-react';

const InteractionForm = () => {
  const dispatch = useDispatch();
  const hcps = useSelector(state => state.crm.hcps);
  const reduxSelectedHcpId = useSelector(state => state.crm.selectedHcpId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  const [formData, setFormData] = useState({
    hcp_id: '',
    type: 'Meeting',
    date_time: new Date().toISOString().slice(0, 16),
    notes: '',
    outcomes: '',
    sentiment: 'Neutral'
  });

  const [dateError, setDateError] = useState('');

  // Sync Redux selection (from AI Chat) to local form state
  useEffect(() => {
    if (reduxSelectedHcpId) {
      setFormData(prev => ({ ...prev, hcp_id: reduxSelectedHcpId }));
      const selectedHcp = hcps.find(h => h.id === parseInt(reduxSelectedHcpId));
      if (selectedHcp) {
        setSearchTerm(selectedHcp.name);
      }
    }
  }, [reduxSelectedHcpId, hcps]);

  useEffect(() => {
    dispatch(fetchHCPs());
  }, [dispatch]);

  const filteredHCPs = useMemo(() => {
    if (!searchTerm) return hcps;
    return hcps.filter(hcp => 
      hcp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hcp.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      hcp.hospital.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, hcps]);

  const selectedHcp = useMemo(() => {
    return hcps.find(h => h.id === parseInt(formData.hcp_id));
  }, [formData.hcp_id, hcps]);

  const handleHcpSelect = (hcp) => {
    setFormData(prev => ({ ...prev, hcp_id: hcp.id.toString() }));
    setSearchTerm(hcp.name);
    setShowDropdown(false);
    dispatch(setSelectedHcpId(hcp.id.toString()));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'date_time') {
      const selectedDate = new Date(value);
      const now = new Date();
      if (selectedDate < now) {
        setDateError('Cannot log an interaction with a past date/time.');
      } else {
        setDateError('');
      }
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hcp_id) {
      alert("Please select a Healthcare Professional first.");
      return;
    }


    const payload = {
      hcp_id: parseInt(formData.hcp_id),
      type: formData.type,
      date_time: formData.date_time,
      notes: formData.notes,
      outcomes: formData.outcomes,
      sentiment: formData.sentiment,
    };

    if (formData.follow_up_desc) {
      payload.follow_up = {
        description: formData.follow_up_desc,
        due_date: formData.follow_up_due ? new Date(formData.follow_up_due).toISOString() : null,
        status: 'Pending'
      };
    }

    dispatch(logInteractionForm(payload));
    alert("Interaction logged successfully!");
    setFormData({ 
      ...formData, 
      notes: '', 
      outcomes: '', 
      follow_up_desc: '', 
      follow_up_due: '' 
    });
    setSearchTerm('');
    dispatch(setSelectedHcpId(''));
  };

  return (
    <div className="animate-fade-in">
      <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: 'var(--text-main)' }}>Log New Interaction</h2>
        
        {/* HCP Search Section */}
        <div style={{ marginBottom: '2rem' }}>
          <label className="input-label">Select Healthcare Professional</label>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
              <input 
                type="text"
                className="form-control"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="Search by name, specialty, or hospital..."
                value={searchTerm}
                onChange={(e) => {
                   setSearchTerm(e.target.value);
                   setShowDropdown(true);
                }}
                onFocus={() => setShowDropdown(true)}
              />
            </div>
            
            {showDropdown && (
              <div style={{ 
                position: 'absolute', 
                top: '100%', 
                left: 0, 
                right: 0, 
                zIndex: 10, 
                background: '#fff', 
                border: '1px solid var(--border-color)', 
                borderRadius: '0.5rem', 
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                marginTop: '0.5rem',
                maxHeight: '250px',
                overflowY: 'auto'
              }}>
                {filteredHCPs.length > 0 ? filteredHCPs.map(hcp => (
                  <div 
                    key={hcp.id} 
                    onClick={() => handleHcpSelect(hcp)}
                    style={{ 
                      padding: '0.75rem 1rem', 
                      cursor: 'pointer', 
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                    onMouseLeave={(e) => e.target.style.background = 'transparent'}
                  >
                    <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{hcp.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{hcp.specialty} • {hcp.hospital}</div>
                  </div>
                )) : (
                  <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>No HCP found</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Selected HCP Card */}
        {selectedHcp && (
          <div style={{ 
            background: '#f0f9ff', 
            border: '1px solid #bae6fd', 
            borderRadius: '0.75rem', 
            padding: '1.25rem', 
            marginBottom: '2rem',
            display: 'flex',
            gap: '1.5rem',
            alignItems: 'center'
          }}>
            <div style={{ background: '#0ea5e9', color: '#fff', padding: '0.75rem', borderRadius: '50%' }}>
              <User size={32} />
            </div>
            <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Full Name</p>
                <p style={{ fontWeight: '700', color: '#0c4a6e' }}>{selectedHcp.name}</p>
              </div>
              <div>
                <p style={{ fontSize: '0.75rem', fontWeight: '600', color: '#0369a1', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Specialty</p>
                <p style={{ fontWeight: '700', color: '#0c4a6e' }}>{selectedHcp.specialty}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Building2 size={16} color="#0369a1" />
                <p style={{ fontSize: '0.9rem', color: '#0c4a6e' }}>{selectedHcp.hospital}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={16} color="#0369a1" />
                <p style={{ fontSize: '0.9rem', color: '#0c4a6e' }}>{selectedHcp.location}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="input-group">
            <label className="input-label">Interaction Type</label>
            <select name="type" className="form-control" value={formData.type} onChange={handleChange}>
              <option value="Meeting">Meeting</option>
              <option value="Call">Call</option>
              <option value="Email">Email</option>
              <option value="Event">Event</option>
            </select>
          </div>

          <div className="input-group">
            <label className="input-label">Date & Time</label>
            <input 
              type="datetime-local" 
              name="date_time" 
              className="form-control"
              value={formData.date_time}
              onChange={handleChange}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
            {dateError && <span style={{ color: 'var(--danger-color)', fontSize: '0.85rem', marginTop: '0.25rem' }}><AlertCircle size={14} style={{ display: 'inline', marginRight: '4px' }}/> {dateError}</span>}
          </div>

          <div className="input-group">
            <label className="input-label">Sentiment</label>
            <select name="sentiment" className="form-control" value={formData.sentiment} onChange={handleChange}>
              <option value="Positive">Positive 🟢</option>
              <option value="Neutral">Neutral ⚪</option>
              <option value="Negative">Negative 🔴</option>
            </select>
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Discussion Notes</label>
          <textarea 
            name="notes" 
            className="form-control" 
            rows="4"
            placeholder="Detailed notes from the interaction..."
            value={formData.notes}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        <div className="input-group">
          <label className="input-label">Outcomes & Next Steps</label>
          <textarea 
            name="outcomes" 
            className="form-control" 
            rows="3"
            placeholder="Agreed upon outcomes and follow up actions..."
            value={formData.outcomes}
            onChange={handleChange}
          ></textarea>
        </div>

        {/* Follow up Section */}
        <div style={{ borderTop: '1px solid var(--border-color)', margin: '1.5rem 0', paddingTop: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
             <Save size={18} /> Schedule Follow-up (Optional)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="input-group">
              <label className="input-label">Follow-up Task</label>
              <input 
                type="text" 
                name="follow_up_desc" 
                className="form-control" 
                placeholder="e.g., Send samples, call back next week"
                value={formData.follow_up_desc || ''} 
                onChange={handleChange}
              />
            </div>
            <div className="input-group">
              <label className="input-label">Due Date</label>
              <input 
                type="date" 
                name="follow_up_due" 
                className="form-control"
                value={formData.follow_up_due || ''}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 2rem' }}>
            <Save size={18} />
            Save Interaction
          </button>
        </div>
      </form>
    </div>
  );
};

export default InteractionForm;

