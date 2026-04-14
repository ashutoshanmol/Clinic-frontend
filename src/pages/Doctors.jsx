import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Doctors = () => {
  const [doctorsList, setDoctorsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/api/public/doctors');
        setDoctorsList(res.data);
      } catch (err) {
        console.error('Error fetching doctors:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
  }, []);

  const getIcon = (specialty) => {
    const lower = specialty?.toLowerCase() || '';
    if (lower.includes('cardio')) return '❤️';
    if (lower.includes('neuro')) return '🧠';
    if (lower.includes('pedia')) return '👶';
    if (lower.includes('ortho')) return '🦴';
    if (lower.includes('derma')) return '✨';
    if (lower.includes('surg')) return '🩺';
    return '👨‍⚕️';
  };

  return (
    <div className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>Our Specialists</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Meet our team of board-certified professionals dedicated to your health and well-being.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2.5rem'
      }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1' }}>Loading doctors...</p>
        ) : doctorsList.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', gridColumn: '1 / -1' }}>No doctors available right now.</p>
        ) : (
          doctorsList.map((doc) => (
            <div key={doc._id} className="glass-panel" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ 
                height: '200px', 
                backgroundColor: 'var(--secondary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '5rem'
              }}>
                {getIcon(doc.specialty)}
              </div>
              <div style={{ padding: '2rem' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {doc.specialty}
                </div>
                <h3 style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: 700 }}>{doc.name}</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Experience: {doc.experience || 'Not specified'}</p>
                
                <button 
                  onClick={() => setSelectedDoctor(doc)}
                  style={{ width: '100%', padding: '0.8rem', backgroundColor: 'transparent', border: '1px solid var(--primary)', color: 'var(--primary)' }}
                >
                  View Profile
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999, padding: '1rem',
          overflowY: 'auto'
        }}>
          <div className="glass-panel" style={{
            width: '100%', maxWidth: '600px', padding: '2.5rem', position: 'relative',
            animation: 'fadeIn 0.3s ease', backgroundColor: 'rgba(255, 255, 255, 0.98)',
            margin: 'auto',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <button 
              onClick={() => setSelectedDoctor(null)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'var(--secondary)', border: 'none', color: 'var(--text)', fontSize: '1.2rem', cursor: 'pointer', borderRadius: '50%', width:'35px', height:'35px', display:'flex', alignItems:'center', justifyContent:'center' }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '4rem', padding: '1rem', backgroundColor: 'var(--secondary)', borderRadius: '12px', minWidth: '100px', textAlign: 'center', flex: '0 0 auto' }}>
                {getIcon(selectedDoctor.specialty)}
              </div>
              <div style={{ flex: '1 1 250px' }}>
                <h2 style={{ fontSize: '2rem', color: 'var(--text)', marginBottom: '0.5rem', fontWeight: 800 }}>{selectedDoctor.name}</h2>
                <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '1rem', fontSize: '1.1rem' }}>{selectedDoctor.specialty}</div>
                <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>
                  Experienced specialist dedicated to providing top-quality care. Please feel free to book an appointment or reach out directly for more details.
                </p>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Experience</div>
                <div style={{ color: 'var(--text)', fontSize: '1.1rem', fontWeight: 600 }}>{selectedDoctor.experience || '--'}</div>
              </div>
              <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Consultation Fee</div>
                <div style={{ color: 'var(--text)', fontSize: '1.1rem', fontWeight: 600 }}>₹{selectedDoctor.consultationFee || '--'}</div>
              </div>
              <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', gridColumn: '1 / -1' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Email</div>
                <div style={{ color: 'var(--text)', fontSize: '1.1rem', fontWeight: 600, wordBreak: 'break-all' }}>{selectedDoctor.email || '--'}</div>
              </div>
              <div style={{ backgroundColor: 'var(--background)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)', gridColumn: '1 / -1' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Phone</div>
                <div style={{ color: 'var(--text)', fontSize: '1.1rem', fontWeight: 600 }}>{selectedDoctor.phone || '--'}</div>
              </div>
            </div>

            <button 
              onClick={() => { window.location.href = '/book' }}
              style={{ width: '100%', padding: '1rem', fontSize: '1.1rem', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)' }}
            >
              Book Appointment Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Doctors;
