import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [status, setStatus] = useState({ loading: false, error: null });
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!formData.firstName.trim()) errors.firstName = "First Name is required";
    if (!formData.lastName.trim()) errors.lastName = "Last Name is required";
    if (!formData.email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) errors.email = "Invalid email format";
    if (formData.password.length < 6) errors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = "Passwords don't match";
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setStatus({ loading: true, error: null });
    try {
      await axios.post('/api/public/register', {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password
      });
      alert(`Account created for ${formData.firstName}! You can now log in.`);
      navigate('/login');
    } catch (err) {
      setStatus({ 
        loading: false, 
        error: err.response?.data?.message || 'Registration failed. Please try again.' 
      });
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    marginBottom: '1.2rem',
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
    <div className="container" style={{ 
      minHeight: '70vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      paddingTop: '2rem',
      paddingBottom: '2rem'
    }}>
      <div className="glass-panel" style={{ 
        width: '100%', 
        maxWidth: '500px', 
        padding: '3rem 2.5rem',
        animation: 'fadeIn 0.5s ease',
        backgroundColor: 'var(--card-bg)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--primary)', marginBottom: '0.5rem' }}>
            Create Account
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Join MediCare Clinic to manage your health</p>
        </div>

        {status.error && (
          <div style={{ marginBottom: '1.5rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {status.error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-grid" style={{ marginBottom: '0rem', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>First Name</label>
              <input 
                type="text" 
                placeholder="" 
                style={inputStyle} 
                value={formData.firstName}
                onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.firstName && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.8rem', marginBottom: '0.8rem', display: 'block' }}>{formErrors.firstName}</span>}
            </div>
            <div>
               <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Last Name</label>
              <input 
                type="text" 
                placeholder="" 
                style={inputStyle} 
                value={formData.lastName}
                onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.lastName && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.8rem', marginBottom: '0.8rem', display: 'block' }}>{formErrors.lastName}</span>}
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
            <input 
              type="email" 
              placeholder="" 
              style={inputStyle} 
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
            {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.8rem', marginBottom: '0.8rem', display: 'block' }}>{formErrors.email}</span>}
          </div>

          <div>
             <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Password</label>
            <input 
              type="password" 
              placeholder="Create a password" 
              style={inputStyle} 
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
            {formErrors.password && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.8rem', marginBottom: '0.8rem', display: 'block' }}>{formErrors.password}</span>}
          </div>

          <div>
             <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Confirm Password</label>
            <input 
              type="password" 
              placeholder="Confirm your password" 
              style={inputStyle} 
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            />
            {formErrors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.8rem', marginBottom: '0.8rem', display: 'block' }}>{formErrors.confirmPassword}</span>}
          </div>

          <button type="submit" disabled={status.loading} style={{ 
            width: '100%', padding: '1rem', fontSize: '1.1rem', marginTop: '0.5rem', marginBottom: '1.5rem',
            opacity: status.loading ? 0.7 : 1, cursor: status.loading ? 'not-allowed' : 'pointer',
            boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
          }}>
            {status.loading ? 'Registering...' : 'Register Now'}
          </button>
        </form>

        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
