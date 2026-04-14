import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManageStaff = () => {
  const navigate = useNavigate();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'Receptionist', salary: '', address: '' });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');

  const fetchStaff = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/staff');
      setStaffList(res.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load staff list');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Valid email is required";
    if (!formData.password || formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (!formData.phone.match(/^\+?[\d\s-]{10,}$/)) errors.phone = "Valid phone is required";
    if (!formData.salary) errors.salary = "Salary is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await axios.post('http://localhost:5000/api/staff', formData);
      setShowAddForm(false);
      setFormData({ name: '', email: '', password: '', phone: '', role: 'Receptionist', salary: '', address: '' });
      fetchStaff();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this staff member?')) {
      try {
        await axios.delete(`http://localhost:5000/api/staff/${id}`);
        fetchStaff();
      } catch (err) {
        setError('Failed to delete staff');
      }
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <button onClick={() => navigate('/admin')} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>&larr; Back to Dashboard</button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text)' }}>Manage Staff</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          {showAddForm ? 'Cancel' : '+ Add Staff'}
        </button>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

      {showAddForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'var(--card-bg)' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Add New Staff Member</h2>
          <form onSubmit={handleAddSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)', marginBottom: '0.2rem' }} />
              {formErrors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.name}</span>}
            </div>
            <div>
              <label>Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)', marginBottom: '0.2rem' }} />
              {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.email}</span>}
            </div>
            <div>
              <label>Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)', marginBottom: '0.2rem' }} />
              {formErrors.password && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.password}</span>}
            </div>
            <div>
              <label>Phone</label>
              <input type="text" name="phone" value={formData.phone} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)', marginBottom: '0.2rem' }} />
              {formErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.phone}</span>}
            </div>
            <div><label>Role</label><select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)' }}><option>Receptionist</option><option>Nurse</option><option>Manager</option><option>Other</option></select></div>
            <div>
              <label>Salary (₹)</label>
              <input type="number" name="salary" value={formData.salary} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)', marginBottom: '0.2rem' }} />
              {formErrors.salary && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.salary}</span>}
            </div>
            <div style={{ gridColumn: '1 / -1' }}><label>Address</label><input type="text" name="address" value={formData.address} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)' }} /></div>
            <button type="submit" className="btn btn-primary" style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>Save Staff</button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading staff...</p>
      ) : staffList.length === 0 ? (
        <p className="glass-panel" style={{ padding: '2rem', textAlign: 'center', backgroundColor: 'var(--card-bg)', color: 'var(--text-muted)' }}>No staff members found.</p>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', backgroundColor: 'var(--card-bg)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderBottom: '1px solid var(--border-color)' }}>
                <th style={{ padding: '1rem', color: 'var(--text)' }}>Name</th>
                <th style={{ padding: '1rem', color: 'var(--text)' }}>Role</th>
                <th style={{ padding: '1rem', color: 'var(--text)' }}>Email</th>
                <th style={{ padding: '1rem', color: 'var(--text)' }}>Phone</th>
                <th style={{ padding: '1rem', color: 'var(--text)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {staffList.map((staff) => (
                <tr key={staff._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text)' }}><strong>{staff.name}</strong></td>
                  <td style={{ padding: '1rem' }}><span style={{ backgroundColor: 'var(--primary)', color: 'white', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.8rem' }}>{staff.role}</span></td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{staff.email}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{staff.phone}</td>
                  <td style={{ padding: '1rem' }}>
                    <button onClick={() => handleDelete(staff._id)} style={{ color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ManageStaff;
