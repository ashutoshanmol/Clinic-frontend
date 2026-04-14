import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ViewMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/admin/messages');
        setMessages(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError('Failed to fetch contact messages');
        setLoading(false);
      }
    };
    fetchMessages();
  }, []);

  return (
    <div className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
      <button 
        onClick={() => navigate('/admin')}
        style={{ marginBottom: '2rem', padding: '0.6rem 1.2rem', background: 'transparent', color: 'var(--primary)', border: '1px solid var(--primary)', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
      >
        &larr; Back to Dashboard
      </button>

      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Contact Messages</h1>
        <p style={{ color: 'var(--text-muted)' }}>View and respond to inquiries submitted via the Contact page.</p>
      </div>

      <div style={{ display: 'grid', gap: '1.5rem' }}>
        {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
        
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading messages...</p>
        ) : messages.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No new messages.</p>
        ) : (
          messages.map((msg, idx) => (
             <div key={msg._id} className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.25rem', fontWeight: 700 }}>{msg.subject}</h3>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>From: <span style={{ color: 'var(--text)', fontWeight: 600 }}>{msg.name}</span> ({msg.email})</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.5rem', fontWeight: 500 }}>{new Date(msg.createdAt).toLocaleDateString()}</div>
                    <span style={{ 
                      padding: '0.3rem 0.8rem', 
                      borderRadius: '12px', 
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      backgroundColor: msg.status === 'Unread' ? 'rgba(59, 130, 246, 0.1)' : 'rgba(100, 116, 139, 0.1)',
                      color: msg.status === 'Unread' ? 'var(--primary)' : 'var(--text-muted)',
                      border: `1px solid ${msg.status === 'Unread' ? 'rgba(59, 130, 246, 0.2)' : 'transparent'}`
                    }}>
                      {msg.status}
                    </span>
                  </div>
                </div>
                <div style={{ color: 'var(--text)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {msg.message}
                </div>
             </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViewMessages;
