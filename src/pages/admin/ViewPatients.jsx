import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewPatients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', age: '', gender: '', bloodGroup: '', address: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get('/api/admin/patients');
        setPatients(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching patients:', err);
        setError('Failed to fetch patients list');
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Valid email is required";
    if (!isEditing && (!formData.password || formData.password.length < 6)) errors.password = "Password must be at least 6 characters";
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null); setSuccess(null);
    try {
      if (isEditing) {
        await axios.put(`/api/admin/patients/${editingId}`, formData);
        setSuccess('Patient updated successfully!');
      } else {
        await axios.post('/api/admin/patients', formData);
        setSuccess('Patient added successfully!');
      }
      setFormData({ name: '', email: '', password: '', phone: '', age: '', gender: '', bloodGroup: '', address: '' });
      setIsEditing(false);
      setEditingId(null);
      setShowForm(false);
      fetchPatients();
    } catch (err) {
      setError(err.response?.data?.message || `Error ${isEditing ? 'updating' : 'adding'} patient`);
    }
  };

  const handleEdit = (pt) => {
    setIsEditing(true);
    setEditingId(pt._id);
    setShowForm(true);
    setFormData({
      name: pt.name || '', email: pt.email || '', password: '', phone: pt.phone || '',
      age: pt.age || '', gender: pt.gender || '', bloodGroup: pt.bloodGroup || '', address: pt.address || ''
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this patient?')) {
      try {
        await axios.delete(`/api/admin/patients/${id}`);
        setSuccess('Patient deleted successfully!');
        fetchPatients();
      } catch (err) {
        setError('Failed to delete patient');
      }
    }
  };

  const inputStyle = { width: '100%', padding: '0.6rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.9rem', backgroundColor: 'var(--bg-color)', color: 'var(--text)' };

  return (
    <div className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
      <button 
        onClick={() => navigate('/admin')}
        style={{ marginBottom: '2rem', padding: '0.6rem 1.2rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
      >
        &larr; Back to Dashboard
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Patient Directory</h1>
          <p style={{ color: 'var(--text-muted)' }}>View and manage all registered patients in the system.</p>
        </div>
        <button onClick={() => {
          setShowForm(!showForm);
          setIsEditing(false);
          setEditingId(null);
          setFormData({ name: '', email: '', password: '', phone: '', age: '', gender: '', bloodGroup: '', address: '' });
        }} style={{ padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          {showForm ? 'Close Form' : '+ Add Patient'}
        </button>
      </div>

      {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
      {success && <div style={{ color: '#10b981', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{success}</div>}

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'var(--card-bg)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>
            {isEditing ? 'Edit Patient' : 'Add New Patient'}
          </h2>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Full Name *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={{...inputStyle, marginBottom: '0.2rem'}} />
              {formErrors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.name}</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Email *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={{...inputStyle, marginBottom: '0.2rem'}} />
              {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.email}</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Password {isEditing ? '(Optional)' : '*'}</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} style={{...inputStyle, marginBottom: '0.2rem'}} />
              {formErrors.password && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.password}</span>}
            </div>
            <div><label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Phone</label><input type="text" name="phone" value={formData.phone} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Age</label><input type="number" name="age" value={formData.age} onChange={handleChange} style={inputStyle} /></div>
            <div><label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Gender</label>
              <select name="gender" value={formData.gender} onChange={handleChange} style={inputStyle}>
                <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
              </select>
            </div>
            <div><label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Blood Group</label><input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={inputStyle} /></div>
            <div style={{ gridColumn: '1 / -1' }}><label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} style={inputStyle} /></div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                {isEditing ? 'Save Changes' : 'Add Patient'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto', backgroundColor: 'var(--card-bg)' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading patient data...</p>
        ) : patients.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No patients currently registered in the system.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--secondary)' }}>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Name</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Email</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Phone</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Age/Gender</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Blood Group</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map(patient => (
                <tr key={patient._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem', color: 'var(--text)', fontWeight: 600 }}>{patient.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{patient.email}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{patient.phone}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{patient.age} / {patient.gender}</td>
                  <td style={{ padding: '1rem' }}>
                    {patient.bloodGroup ? (
                      <span style={{ 
                        padding: '0.3rem 0.8rem', 
                        backgroundColor: 'rgba(239, 68, 68, 0.1)', 
                        color: '#ef4444', 
                        borderRadius: '12px',
                        fontSize: '0.85rem',
                        fontWeight: 600
                      }}>{patient.bloodGroup}</span>
                    ) : <span style={{ color: 'var(--text-muted)' }}>-</span>}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button onClick={() => handleEdit(patient)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'var(--secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer', color: 'var(--text)' }}>Edit</button>
                      <button onClick={() => handleDelete(patient._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ViewPatients;
