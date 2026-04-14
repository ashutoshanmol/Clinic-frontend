import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminProfile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  const [profileData, setProfileData] = useState({ name: user.name || '' });
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [profileErrors, setProfileErrors] = useState({});
  const [passwordErrors, setPasswordErrors] = useState({});
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleProfileChange = (e) => setProfileData({ ...profileData, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value });

  const updateProfile = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!profileData.name.trim()) errors.name = "Name is required";
    setProfileErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setMessage(''); setError('');
    try {
      const res = await axios.put('/api/admin/profile', {
        email: user.email,
        name: profileData.name
      });
      setMessage(res.data.message);
      // Update local storage
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) errors.newPassword = "New password is required";
    else if (passwordData.newPassword.length < 6) errors.newPassword = "Password must be at least 6 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setMessage(''); setError('');
    try {
      const res = await axios.put('/api/admin/change-password', {
        email: user.email,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage(res.data.message);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/admin')} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>&larr; Back to Dashboard</button>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text)' }}>Admin Profile Settings</h1>

      {message && <div style={{ padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '1rem' }}>{message}</div>}
      {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}

      <div className="glass-panel" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: 'var(--card-bg)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Update Profile Information</h2>
        <form onSubmit={updateProfile} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Email (Read-only)</label>
            <input type="email" value={user.email} disabled style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Full Name</label>
            <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)' }} />
            {profileErrors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{profileErrors.name}</span>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Update Profile</button>
        </form>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>Change Password</h2>
        <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Current Password</label>
            <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)' }} />
            {passwordErrors.currentPassword && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{passwordErrors.currentPassword}</span>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>New Password</label>
            <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)' }} />
            {passwordErrors.newPassword && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{passwordErrors.newPassword}</span>}
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Confirm New Password</label>
            <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)' }} />
            {passwordErrors.confirmPassword && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{passwordErrors.confirmPassword}</span>}
          </div>
          <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start', marginTop: '1rem' }}>Change Password</button>
        </form>
      </div>
    </div>
  );
};

export default AdminProfile;
