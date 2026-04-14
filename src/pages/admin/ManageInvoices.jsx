import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ManageInvoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // For Generate Invoice Form
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    patientEmail: '',
    doctorName: '',
    amount: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/invoices');
      setInvoices(res.data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
      setError('Failed to fetch invoices list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(`/api/invoices/${id}`, { status: newStatus, paymentMethod: newStatus === 'Paid' ? 'Online' : '' });
      setInvoices(prev => prev.map(inv => inv._id === id ? { ...inv, status: newStatus } : inv));
    } catch (err) {
      alert('Failed to update invoice status');
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.patientName.trim()) errors.patientName = "Patient name is required";
    if (!formData.patientEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.patientEmail = "Valid email is required";
    if (!formData.doctorName.trim()) errors.doctorName = "Doctor name is required";
    if (!formData.amount || formData.amount <= 0) errors.amount = "Valid amount is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setFormError('');
    setFormSuccess('');
    try {
      await axios.post('/api/invoices', formData);
      setFormSuccess('Invoice generated successfully!');
      setFormData({ patientName: '', patientEmail: '', doctorName: '', amount: '', notes: '' });
      fetchInvoices();
      setTimeout(() => setShowForm(false), 2000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error generating invoice');
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
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Billing & Invoices</h1>
          <p style={{ color: 'var(--text-muted)' }}>Generate new bills and track payment streams.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{ padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
          {showForm ? 'Close Form' : '+ Generate Invoice'}
        </button>
      </div>

      {showForm && (
        <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'var(--card-bg)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Generate New Invoice</h2>
          {formError && <div style={{ color: '#ef4444', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>{formError}</div>}
          {formSuccess && <div style={{ color: '#10b981', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px' }}>{formSuccess}</div>}
          
          <form onSubmit={handleGenerate} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Patient Name *</label>
              <input type="text" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} style={{...inputStyle, marginBottom: '0.2rem'}} />
              {formErrors.patientName && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.patientName}</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Patient Email *</label>
              <input type="email" value={formData.patientEmail} onChange={e => setFormData({...formData, patientEmail: e.target.value})} style={{...inputStyle, marginBottom: '0.2rem'}} />
              {formErrors.patientEmail && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.patientEmail}</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Doctor Name *</label>
              <input type="text" value={formData.doctorName} onChange={e => setFormData({...formData, doctorName: e.target.value})} style={{...inputStyle, marginBottom: '0.2rem'}} />
              {formErrors.doctorName && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.doctorName}</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Total Amount (₹) *</label>
              <input type="number" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} style={{...inputStyle, marginBottom: '0.2rem'}} />
              {formErrors.amount && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.amount}</span>}
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '0.3rem', fontSize: '0.85rem' }}>Notes / Description</label>
              <input type="text" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} placeholder="e.g. Consultation fee + blood test" style={inputStyle} />
            </div>
            
            <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
              <button type="submit" style={{ padding: '0.8rem 1.5rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                Generate Bill
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto', backgroundColor: 'var(--card-bg)' }}>
        {error ? (
           <p style={{ color: '#ef4444' }}>{error}</p>
        ) : loading ? (
           <p style={{ color: 'var(--text-muted)' }}>Loading invoices...</p>
        ) : invoices.length === 0 ? (
           <p style={{ color: 'var(--text-muted)' }}>No invoices have been generated yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--secondary)' }}>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Patient</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Amount</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map(inv => (
                <tr key={inv._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {new Date(inv.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text)' }}>{inv.patientName}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{inv.patientEmail}</div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 700, color: 'var(--text)' }}>
                    ₹{inv.amount.toFixed(2)}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '12px', 
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backgroundColor: inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' 
                        : inv.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)'
                        : 'rgba(245, 158, 11, 0.1)',
                      color: inv.status === 'Paid' ? '#10b981' 
                        : inv.status === 'Cancelled' ? '#ef4444'
                        : '#f59e0b'
                    }}>
                      {inv.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {inv.status === 'Pending' && (
                        <>
                          <button onClick={() => handleStatusUpdate(inv._id, 'Paid')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Mark Paid</button>
                          <button onClick={() => handleStatusUpdate(inv._id, 'Cancelled')} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                        </>
                      )}
                      <button onClick={() => window.print()} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: 'var(--secondary)', color: 'var(--text)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>Print</button>
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

export default ManageInvoices;
