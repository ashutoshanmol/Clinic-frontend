import React, { useState } from 'react';
import axios from 'axios';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [status, setStatus] = useState({ loading: false, error: null, success: null });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) errors.email = "Invalid email format";
    if (!formData.subject.trim()) errors.subject = "Subject is required";
    if (!formData.message.trim()) errors.message = "Message is required";
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setStatus({ loading: true, error: null, success: null });
    try {
      await axios.post('/api/public/contact', formData);
      setStatus({ loading: false, error: null, success: 'Thank you for your message. Our team will contact you shortly.' });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus({ 
        loading: false, 
        error: err.response?.data?.message || 'Something went wrong. Please try again.', 
        success: null 
      });
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    marginBottom: '1.5rem',
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '1rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  return (
    <div className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>Contact Us</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Have a question or want to book an appointment? Send us a message and we'll get back to you.
        </p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4rem' }}>
        
        {/* Contact Info Side */}
        <div style={{ flex: '1 1 300px' }}>
          <div className="glass-panel" style={{ padding: '2.5rem', marginBottom: '2rem', backgroundColor: 'var(--card-bg)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--primary)', fontWeight: 700 }}>Get in Touch</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Address</strong>
                <span style={{ color: 'var(--text-muted)' }}>123 Health Ave, Medical District<br/>New York, NY 10001</span>
              </div>
              
              <div>
                <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Phone</strong>
                <span style={{ color: 'var(--text-muted)' }}>+1 (555) 123-4567<br/>+1 (555) 987-6543 (Emergency)</span>
              </div>
              
              <div>
                <strong style={{ color: 'var(--text)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>Email</strong>
                <span style={{ color: 'var(--text-muted)' }}>contact@medicareclinic.com</span>
              </div>
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: '2.5rem', backgroundColor: 'var(--card-bg)' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', color: 'var(--text)', fontWeight: 700 }}>Opening Hours</h3>
            <ul style={{ listStyle: 'none', padding: 0, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 500, color: 'var(--text)' }}>Monday - Friday</span> <span>8:00 AM - 8:00 PM</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                <span style={{ fontWeight: 500, color: 'var(--text)' }}>Saturday</span> <span>9:00 AM - 5:00 PM</span>
              </li>
              <li style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500, color: 'var(--text)' }}>Sunday</span> <span style={{ color: 'var(--primary)', fontWeight: 600 }}>Emergency Only</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Form Side */}
        <div className="glass-panel" style={{ flex: '2 1 400px', padding: '3rem', backgroundColor: 'var(--card-bg)' }}>
          <form onSubmit={handleSubmit}>
            <div className="form-grid" style={{ marginBottom: '1.5rem', alignItems: 'start' }}>
              <div style={{ width: '100%' }}>
                <input 
                  type="text" 
                  placeholder="Your Name" 
                  style={{...inputStyle, marginBottom: 0}} 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                {formErrors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem' }}>{formErrors.name}</span>}
              </div>
              <div style={{ width: '100%' }}>
                <input 
                  type="email" 
                  placeholder="Your Email" 
                  style={{...inputStyle, marginBottom: 0}} 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                />
                {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem' }}>{formErrors.email}</span>}
              </div>
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <input 
                type="text" 
                placeholder="Subject" 
                style={{...inputStyle, marginBottom: 0}} 
                value={formData.subject}
                onChange={e => setFormData({...formData, subject: e.target.value})}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.subject && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem' }}>{formErrors.subject}</span>}
            </div>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <textarea 
                placeholder="Your Message..." 
                style={{ ...inputStyle, minHeight: '200px', resize: 'vertical', marginBottom: 0 }} 
                value={formData.message}
                onChange={e => setFormData({...formData, message: e.target.value})}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.message && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.3rem' }}>{formErrors.message}</span>}
            </div>
            
            <button type="submit" disabled={status.loading} style={{ 
              width: '100%', padding: '1.2rem', fontSize: '1.1rem', 
              opacity: status.loading ? 0.7 : 1, cursor: status.loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
            }}>
              {status.loading ? 'Sending...' : 'Send Message'}
            </button>

            {status.success && <div style={{ marginTop: '1.5rem', color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{status.success}</div>}
            {status.error && <div style={{ marginTop: '1.5rem', color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{status.error}</div>}
          </form>
        </div>
        
      </div>
    </div>
  );
};

export default Contact;
