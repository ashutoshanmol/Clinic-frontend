import React from 'react';

const Services = () => {
  const servicesList = [
    { title: 'General Checkup', desc: 'Comprehensive health evaluations to keep you at your best.', icon: '🩺' },
    { title: 'Dental Care', desc: 'Complete oral health services including cleaning and surgery.', icon: '🦷' },
    { title: 'Pediatrics', desc: 'Specialized medical care tailored for infants and children.', icon: '🧸' },
    { title: 'Cardiology', desc: 'Heart health monitoring, diagnosis, and treatment plans.', icon: '❤️' },
    { title: 'Neurology', desc: 'Expert care for disorders of the brain and nervous system.', icon: '🧠' },
    { title: 'Laboratory', desc: 'Fast and accurate diagnostic testing and medical imaging.', icon: '🔬' },
  ];

  return (
    <div className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>Medical Services</h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          We offer a wide range of state-of-the-art medical services to cater to all your healthcare needs.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem'
      }}>
        {servicesList.map((service, idx) => (
          <div key={idx} className="glass-panel" style={{ 
            padding: '2.5rem', 
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-5px)';
            e.currentTarget.style.boxShadow = '0 20px 40px -10px rgba(0,0,0,0.1)';
            e.currentTarget.style.borderColor = 'var(--primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'var(--glass-shadow)';
            e.currentTarget.style.borderColor = 'var(--border-color)';
          }}>
            <div style={{ 
              fontSize: '3rem', 
              marginBottom: '1.5rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '80px',
              height: '80px',
              backgroundColor: 'var(--secondary)',
              borderRadius: '50%'
            }}>
              {service.icon}
            </div>
            <h3 style={{ fontSize: '1.5rem', color: 'var(--text)', marginBottom: '1rem', fontWeight: 600 }}>{service.title}</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6 }}>{service.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Services;
