import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const medicalSpecialties = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Physician', 
  'Gynecology', 'Hematology', 'Internal Medicine', 'Nephrology', 'Neurology', 
  'Oncology', 'Ophthalmology', 'Orthopedics', 'ENT', 'Pediatrics', 
  'Psychiatry', 'Pulmonology', 'Radiology', 'Rheumatology', 'Urology', 'Dentistry'
];

const ManageDoctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    specialty: '',
    email: '',
    password: '',
    phone: '',
    experience: '',
    consultationFee: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/doctors');
      setDoctors(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to fetch doctors');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.specialty) errors.specialty = "Specialty is required";
    if (!formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) errors.email = "Valid email is required";
    if (!isEditing && (!formData.password || formData.password.length < 6)) errors.password = "Password must be at least 6 characters";
    if (!formData.phone.match(/^\+?[\d\s-]{10,}$/)) errors.phone = "Valid phone is required";
    if (!formData.experience) errors.experience = "Experience is required";
    if (!formData.consultationFee) errors.consultationFee = "Fee is required";

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setError(null);
    setSuccess(null);
    try {
      if (isEditing) {
        await axios.put(`http://localhost:5000/api/admin/doctors/${editingId}`, formData);
        setSuccess('Doctor updated successfully!');
      } else {
        await axios.post('http://localhost:5000/api/admin/doctors', formData);
        setSuccess('Doctor added successfully!');
      }
      setFormData({
        name: '', specialty: '', email: '', password: '', phone: '', experience: '', consultationFee: ''
      });
      setIsEditing(false);
      setEditingId(null);
      fetchDoctors(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || `Error ${isEditing ? 'updating' : 'adding'} doctor`);
    }
  };

  const handleEdit = (doc) => {
    setIsEditing(true);
    setEditingId(doc._id);
    setFormData({
      name: doc.name,
      specialty: doc.specialty,
      email: doc.email,
      password: '', // Leave empty unless changing
      phone: doc.phone,
      experience: doc.experience,
      consultationFee: doc.consultationFee
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if(window.confirm('Are you sure you want to delete this doctor?')) {
      try {
        await axios.delete(`http://localhost:5000/api/admin/doctors/${id}`);
        setSuccess('Doctor deleted successfully!');
        fetchDoctors();
      } catch (err) {
        setError('Failed to delete doctor');
      }
    }
  };

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 1rem',
    marginBottom: '1rem',
    backgroundColor: '#f8fafc',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text)',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const selectStyle = {
    ...inputStyle,
    cursor: 'pointer',
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    backgroundSize: '1em'
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
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Manage Doctors</h1>
        <p style={{ color: 'var(--text-muted)' }}>Add new doctors and view current staff directory.</p>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        {/* Add/Edit Doctor Form */}
        <div className="glass-panel" style={{ flex: '1 1 350px', padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--text)', fontWeight: 700 }}>
              {isEditing ? 'Edit Doctor' : 'Add New Doctor'}
            </h2>
            {isEditing && (
              <button 
                onClick={() => {
                  setIsEditing(false);
                  setEditingId(null);
                  setFormData({ name: '', specialty: '', email: '', password: '', phone: '', experience: '', consultationFee: '' });
                }} 
                style={{ padding: '0.4rem 0.8rem', backgroundColor: 'transparent', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem', cursor: 'pointer' }}
              >
                Cancel Edit
              </button>
            )}
          </div>
          
          {error && <div style={{ color: '#ef4444', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>{error}</div>}
          {success && <div style={{ color: '#10b981', marginBottom: '1.5rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>{success}</div>}
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <input type="text" name="name" placeholder="Full Name" style={{...inputStyle, marginBottom: '0.2rem'}} value={formData.name} onChange={handleChange} 
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.name}</span>}
            </div>
            <div>
              <select 
                name="specialty" 
                style={{...selectStyle, marginBottom: '0.2rem'}} 
                value={formData.specialty} 
                onChange={handleChange} 
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              >
                <option value="" disabled>Select Specialty...</option>
                {medicalSpecialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              {formErrors.specialty && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.specialty}</span>}
            </div>
            <div>
              <input type="email" name="email" placeholder="Email Address" style={{...inputStyle, marginBottom: '0.2rem'}} value={formData.email} onChange={handleChange} 
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.email && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.email}</span>}
            </div>
            <div>
              <input type="password" name="password" placeholder={isEditing ? "Leave blank to keep current password" : "Account Password"} style={{...inputStyle, marginBottom: '0.2rem'}} value={formData.password} onChange={handleChange} 
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.password && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.password}</span>}
            </div>
            <div>
              <input type="tel" name="phone" placeholder="Phone Number" style={{...inputStyle, marginBottom: '0.2rem'}} value={formData.phone} onChange={handleChange} 
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.phone}</span>}
            </div>
            <div>
              <input type="number" name="experience" placeholder="Years of Experience" style={{...inputStyle, marginBottom: '0.2rem'}} value={formData.experience} onChange={handleChange} 
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.experience && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.experience}</span>}
              <label>Consultation Fee</label>
              <input type="number" name="consultationFee" placeholder="Consultation Fee (₹)" style={{...inputStyle, marginBottom: '0.2rem'}} value={formData.consultationFee} onChange={handleChange} 
                 onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                 onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.consultationFee && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.consultationFee}</span>}
            </div>
            
            <button type="submit" style={{ width: '100%', padding: '1.2rem', fontSize: '1.1rem', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)', marginTop: '0.5rem' }}>
              {isEditing ? 'Save Changes' : 'Add Doctor'}
            </button>
          </form>
        </div>

        {/* Doctors List */}
        <div className="glass-panel" style={{ flex: '2 1 450px', padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)', fontWeight: 700 }}>Doctor Directory</h2>
          
          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No doctors found. Add one to get started.</p>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {doctors.map(doctor => (
                <div key={doctor._id} style={{ 
                  padding: '1.5rem', 
                  backgroundColor: 'var(--background)', 
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', color: 'var(--text)', marginBottom: '0.25rem', fontWeight: 700 }}>Dr. {doctor.name}</h3>
                    <p style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '0.5rem', fontWeight: 600 }}>{doctor.specialty}</p>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                      <span>✉️ {doctor.email}</span>
                      <span>📞 {doctor.phone}</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fee</div>
                    <div style={{ color: 'var(--text)', fontWeight: 700, fontSize: '1.2rem' }}>₹{doctor.consultationFee}</div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button onClick={() => handleEdit(doctor)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'var(--secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', cursor: 'pointer' }}>Edit</button>
                      <button onClick={() => handleDelete(doctor._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', cursor: 'pointer' }}>Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageDoctors;
