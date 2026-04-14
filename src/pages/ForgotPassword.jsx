import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // STEP 1: Generate OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) errors.email = "Invalid email format";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setMessage(''); setError(''); setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/public/forgot-password', { email });
      setMessage(res.data.message);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to request password reset');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const errors = {};
    if (otp.length < 6) errors.otp = "OTP must be 6 digits";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setMessage(''); setError(''); setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/public/verify-otp', { email, otp });
      setMessage(res.data.message);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setMessage(''); setError(''); setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/public/reset-password', {
        email,
        otp,
        newPassword
      });

      setMessage(res.data.message + ' Redirecting to login...');
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '1rem', marginBottom: '1rem', backgroundColor: '#f8fafc',
    border: '2px solid var(--border-color)', borderRadius: '12px', color: 'var(--text)',
    fontSize: '1rem', outline: 'none', transition: 'all 0.3s ease'
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '3rem 2.5rem', animation: 'fadeIn 0.5s ease', border: '1px solid rgba(255,255,255,0.7)' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', margin: '0 auto 1rem shadow-lg' }}>
            {step === 1 ? '📧' : step === 2 ? '🔐' : '✨'}
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
            {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify Identity' : 'Create New Password'}
          </h1>
          <div style={{ display: 'flex', gap: '5px', justifyContent: 'center', marginTop: '1rem' }}>
            <div style={{ height: '4px', width: '30px', borderRadius: '2px', backgroundColor: step >= 1 ? 'var(--primary)' : 'var(--border-color)' }}></div>
            <div style={{ height: '4px', width: '30px', borderRadius: '2px', backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--border-color)' }}></div>
            <div style={{ height: '4px', width: '30px', borderRadius: '2px', backgroundColor: step >= 3 ? 'var(--primary)' : 'var(--border-color)' }}></div>
          </div>
        </div>

        {message && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#059669', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(16, 185, 129, 0.2)', fontWeight: 600 }}>
            {message}
          </div>
        )}

        {error && (
          <div style={{ padding: '1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center', border: '1px solid rgba(239, 68, 68, 0.2)', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {/* STEP 1 FORM */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
              Enter your registered email address to receive a 6-digit One Time Password (OTP).
            </p>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Email Address</label>
            <input type="email" placeholder="john.doe@example.com" style={inputStyle} value={email} onChange={(e) => setEmail(e.target.value)} onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} />
            {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.8rem', marginBottom: '0.8rem', display: 'block', textAlign: 'left' }}>{formErrors.email}</span>}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: '1.5rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: loading ? 0.7 : 1 }}>
              {loading ? 'Processing...' : 'Send Recovery OTP'}
            </button>
          </form>
        )}

        {/* STEP 2 FORM */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
              We've generated a 6-digit OTP for <strong>{email}</strong>. 
            </p>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>6-Digit OTP</label>
            <input type="text" placeholder="e.g. 123456" style={{...inputStyle, letterSpacing: '5px', textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold'}} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} />
            {formErrors.otp && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.8rem', marginBottom: '0.8rem', display: 'block', textAlign: 'left' }}>{formErrors.otp}</span>}
            <button type="submit" disabled={loading || otp.length < 6} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: '1.5rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: (loading || otp.length < 6) ? 0.7 : 1 }}>
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </form>
        )}

        {/* STEP 3 FORM */}
        {step === 3 && (
          <form onSubmit={handleResetPassword}>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
              Identity verified. Please secure your account with a new password.
            </p>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>New Password</label>
            <input type="password" placeholder="Must be at least 6 characters" style={inputStyle} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} onFocus={(e) => e.target.style.borderColor = 'var(--primary)'} onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'} />
            {formErrors.newPassword && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.8rem', marginBottom: '0.8rem', display: 'block', textAlign: 'left' }}>{formErrors.newPassword}</span>}
            <button type="submit" disabled={loading || newPassword.length < 5} style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: '1.5rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '12px', border: 'none', fontWeight: 700, cursor: 'pointer', opacity: (loading || newPassword.length < 5) ? 0.7 : 1 }}>
              {loading ? 'Updating...' : 'Set New Password'}
            </button>
          </form>
        )}

        {step === 1 && (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            Remember your old password? <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>Log In Here</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
