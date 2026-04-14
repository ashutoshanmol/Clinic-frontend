import React from 'react';

const Footer = () => {
  return (
    <footer style={{
      marginTop: 'auto',
      padding: '3rem 0 1rem',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--background)',
      color: 'var(--text)'
    }}>
      <div className="container" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1.2rem', fontWeight: 800 }}>MediCare Clinic</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Providing next-generation healthcare services with compassion, expertise, and advanced technology.
          </p>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text)', fontWeight: 600 }}>Quick Links</h4>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><a href="/" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Home</a></li>
            <li><a href="/doctors" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Our Doctors</a></li>
            <li><a href="/services" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Services</a></li>
            <li><a href="/contact" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Contact Us</a></li>
          </ul>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text)', fontWeight: 600 }}>Contact Info</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📍 123 Health Ave, Medical District</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>📞 +1 (555) 123-4567</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>✉️ contact@medicareclinic.com</p>
        </div>
      </div>
      
      <div style={{
        borderTop: '1px solid var(--border-color)',
        paddingTop: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-muted)',
        fontSize: '0.85rem'
      }}>
        <p>&copy; {new Date().getFullYear()} MediCare Clinic. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
