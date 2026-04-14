import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/appointments');
        setAppointments(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Failed to fetch appointments list');
        setLoading(false);
      }
    };
    fetchAppointments();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/admin/appointments/${id}`, { status: newStatus });
      setAppointments(prev => prev.map(apt => apt._id === id ? { ...apt, status: newStatus } : apt));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update appointment status');
    }
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to permanently delete this appointment?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/appointments/${id}`);
        setAppointments(prev => prev.filter(apt => apt._id !== id));
      } catch (err) {
        console.error('Error deleting appointment:', err);
        alert('Failed to delete appointment');
      }
    }
  };

  return (
    <div className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
      <button 
        onClick={() => navigate('/admin')}
        style={{ marginBottom: '2rem', padding: '0.6rem 1.2rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
      >
        &larr; Back to Dashboard
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Global Appointments</h1>
        <p style={{ color: 'var(--text-muted)' }}>View all scheduled appointments across the clinic.</p>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', overflowX: 'auto', backgroundColor: 'var(--card-bg)' }}>
        {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading appointments...</p>
        ) : appointments.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No appointments scheduled yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '900px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--secondary)' }}>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Date/Time</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Patient</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Doctor</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Payment</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(apt => (
                <tr key={apt._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.2s' }}>
                  <td style={{ padding: '1rem', color: 'var(--text)' }}>
                    <div style={{ fontWeight: 600 }}>{apt.date}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 500 }}>{apt.time}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text)' }}>
                    <div style={{ fontWeight: 600 }}>{apt.patientName}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 500 }}>{apt.phone}</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                     <div style={{ fontWeight: 500 }}>{apt.doctor}</div>
                     <div style={{ fontSize: '0.8rem' }}>{apt.specialty}</div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.9rem' }}>
                      {apt.paymentMethod || 'Cash'}
                    </div>
                    <span style={{ 
                      display: 'inline-block',
                      marginTop: '0.2rem',
                      padding: '0.15rem 0.5rem', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: (apt.paymentStatus || 'Pending') === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                      color: (apt.paymentStatus || 'Pending') === 'Completed' ? '#10b981' : '#f59e0b'
                    }}>
                      {apt.paymentStatus || 'Pending'}
                    </span>
                    {apt.razorpayPaymentId && (
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.3rem', fontStyle: 'italic' }}>
                        ID: {apt.razorpayPaymentId}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '12px', 
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      backgroundColor: apt.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.1)' 
                        : apt.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' 
                        : 'rgba(100, 116, 139, 0.1)',
                      color: apt.status === 'Confirmed' ? '#10b981' 
                        : apt.status === 'Pending' ? '#f59e0b' 
                        : 'var(--text-muted)'
                    }}>
                      {apt.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                      {apt.status === 'Pending' && (
                        <button 
                          onClick={() => handleStatusUpdate(apt._id, 'Confirmed')}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Confirm
                        </button>
                      )}
                      {apt.status !== 'Cancelled' && (
                        <button 
                          onClick={() => handleStatusUpdate(apt._id, 'Cancelled')}
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: 'transparent', color: '#f59e0b', border: '1px solid #f59e0b', borderRadius: '6px', cursor: 'pointer' }}
                        >
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(apt._id)}
                        style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
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

export default ViewAppointments;
