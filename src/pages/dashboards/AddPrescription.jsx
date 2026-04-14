import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const AddPrescription = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialPatientName = queryParams.get('patientName') || '';

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const [formData, setFormData] = useState({
    patientEmail: '',
    patientName: initialPatientName,
    testRecommendations: '',
    notes: ''
  });

  const [medicines, setMedicines] = useState([
    { name: '', dosage: '', duration: '', instructions: '' }
  ]);
  
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleMedChange = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const addMedRow = () => {
    setMedicines([...medicines, { name: '', dosage: '', duration: '', instructions: '' }]);
  };

  const removeMedRow = (index) => {
    const updated = [...medicines];
    updated.splice(index, 1);
    setMedicines(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = {};
    if (!formData.patientEmail) errors.patientEmail = "Patient Email is required";
    
    const medErrors = medicines.map(m => {
      let medErr = {};
      if (!m.name) medErr.name = "Required";
      if (!m.dosage) medErr.dosage = "Required";
      if (!m.duration) medErr.duration = "Required";
      return medErr;
    });

    const hasMedErrors = medErrors.some(mErr => Object.keys(mErr).length > 0);
    if (hasMedErrors) errors.medicines = medErrors;

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await axios.post('/api/prescriptions', {
        patientEmail: formData.patientEmail,
        doctorName: user.name || 'Doctor',
        date: new Date().toISOString().split('T')[0],
        medicines,
        testRecommendations: formData.testRecommendations,
        notes: formData.notes
      });
      
      setSuccess('Prescription saved successfully!');
      setTimeout(() => navigate('/dashboard/doctor'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add prescription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1rem', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>&larr; Back</button>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', color: 'var(--text)' }}>Write New Prescription</h1>
      
      {error && <div style={{ padding: '1rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '1rem' }}>{error}</div>}
      {success && <div style={{ padding: '1rem', backgroundColor: '#d1fae5', color: '#065f46', borderRadius: '8px', marginBottom: '1rem' }}>{success}</div>}

      <div className="glass-panel" style={{ padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Patient Name</label>
              <input type="text" value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Patient Email *</label>
              <input type="email" value={formData.patientEmail} onChange={e => setFormData({...formData, patientEmail: e.target.value})} placeholder="Required to link to patient account" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)', marginBottom: '0.2rem' }} />
              {formErrors.patientEmail && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.patientEmail}</span>}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label style={{ fontWeight: 600, color: 'var(--text-muted)', fontSize: '1.1rem' }}>Medicines</label>
              <button type="button" onClick={addMedRow} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>+ Add Medicine</button>
            </div>
            
            {medicines.map((med, idx) => (
              <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '1rem', backgroundColor: 'var(--bg-color)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 2fr auto', gap: '0.5rem', alignItems: 'end' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Medicine Name *</label>
                  <input type="text" value={med.name} onChange={e => handleMedChange(idx, 'name', e.target.value)} style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '0.1rem' }} />
                  {formErrors.medicines && formErrors.medicines[idx]?.name && <span style={{ color: '#ef4444', fontSize: '0.7rem', display: 'block' }}>{formErrors.medicines[idx].name}</span>}
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Dosage *</label>
                  <input type="text" value={med.dosage} onChange={e => handleMedChange(idx, 'dosage', e.target.value)} placeholder="e.g. 1-0-1" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '0.1rem' }} />
                  {formErrors.medicines && formErrors.medicines[idx]?.dosage && <span style={{ color: '#ef4444', fontSize: '0.7rem', display: 'block' }}>{formErrors.medicines[idx].dosage}</span>}
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Duration *</label>
                  <input type="text" value={med.duration} onChange={e => handleMedChange(idx, 'duration', e.target.value)} placeholder="e.g. 5 days" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '0.1rem' }} />
                  {formErrors.medicines && formErrors.medicines[idx]?.duration && <span style={{ color: '#ef4444', fontSize: '0.7rem', display: 'block' }}>{formErrors.medicines[idx].duration}</span>}
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Instructions</label>
                  <input type="text" value={med.instructions} onChange={e => handleMedChange(idx, 'instructions', e.target.value)} placeholder="e.g. After meals" style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid var(--border-color)' }} />
                </div>
                {medicines.length > 1 && (
                  <button type="button" onClick={() => removeMedRow(idx)} style={{ padding: '0.5rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: 'none', borderRadius: '4px', cursor: 'pointer', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>X</button>
                )}
              </div>
            ))}
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Lab Test Recommendations</label>
            <input type="text" value={formData.testRecommendations} onChange={e => setFormData({...formData, testRecommendations: e.target.value})} placeholder="e.g. Complete Blood Count (CBC), X-Ray" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)' }} />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: 'var(--text-muted)' }}>Additional Notes / Advice</label>
            <textarea rows="4" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)' }}></textarea>
          </div>

          <button type="submit" disabled={loading} style={{ padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 600, cursor: 'pointer', marginTop: '1rem' }}>
            {loading ? 'Saving...' : 'Save Prescription'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPrescription;
