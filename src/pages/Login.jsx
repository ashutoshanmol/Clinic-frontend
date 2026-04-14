import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/logo_full.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();
  
  const from = location.state?.from || null;

  const handleLogin = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!email.match(/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/)) errors.email = "Invalid email format";
    if (!password) errors.password = "Password is required";
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    try {
      const response = await axios.post('/api/public/login', {
        email,
        password
      });

      const { user } = response.data;
      
      // Store user session in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      // Redirect based on role or 'from' state
      if (from) {
        navigate(from);
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'doctor') {
        navigate('/dashboard/doctor');
      } else {
        navigate('/dashboard/patient');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '1rem',
    marginBottom: '1rem',
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
    <div style={{ 
      minHeight: '80vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '2rem'
    }}>
      <div className="glass-panel" style={{ 
        width: '100%', 
        maxWidth: '450px', 
        padding: '3rem 2.5rem',
        animation: 'fadeIn 0.5s ease',
        boxShadow: 'var(--glass-shadow)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link to="/">
            <img 
              src={logo} 
              alt="MedicareClinic Logo" 
              style={{ height: '120px', margin: '0 auto 3rem auto', mixBlendMode: 'multiply' }} 
            />
          </Link>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>
            Welcome Back
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Please sign in to your account</p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500 }}>Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email" 
                style={inputStyle} 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.8rem', marginBottom: '0.8rem', display: 'block' }}>{formErrors.email}</span>}
            </div>

          <div style={{ marginBottom: '2.5rem' }}>
             <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                style={inputStyle} 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.password && <span style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '-0.8rem', marginBottom: '0.8rem', display: 'block' }}>{formErrors.password}</span>}
              <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                <a href="#" style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 500 }}>Forgot Password?</a>
              </div>
            </div>

          <button type="submit" style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', marginBottom: '1.5rem', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)' }}>
            Sign In
          </button>
        </form>

        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Don't have an account? <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Register here</Link>
        </div>
      </div>

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
};

export default Login;
