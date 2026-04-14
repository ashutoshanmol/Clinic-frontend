import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo_full.png';
import aboutImg from '../assets/about_us.png';
import FeedbackSection from '../components/FeedbackSection';

const Home = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/dashboard/doctor';
    return '/dashboard/patient';
  };

  return (
    <div className="home-wrapper">
      <div className="container">
        {/* Hero Section */}
        <section style={{ 
          display: 'flex', 
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: '80vh',
          padding: '4rem 0',
          flexWrap: 'wrap',
          gap: '2rem'
        }}>
          <div style={{ flex: '1 1 500px' }}>
            <img 
              src={logo} 
              alt="MedicareClinic Logo" 
              style={{ height: '120px', marginBottom: '3rem', mixBlendMode: 'multiply' }} 
            />
            <div style={{ display: 'inline-block', padding: '0.5rem 1rem', backgroundColor: 'var(--secondary)', color: 'var(--primary)', borderRadius: '20px', fontWeight: 600, marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              🩺 Your Health is Our Priority
            </div>
            <h1 className="hero-title" style={{ 
              fontSize: '4rem', 
              fontWeight: 800, 
              marginBottom: '1.5rem',
              color: 'var(--text)',
              lineHeight: 1.15
            }}>
              Next-Generation <span style={{ color: 'var(--primary)' }}>Healthcare</span> Services
            </h1>
            
            <p style={{ 
              fontSize: '1.1rem', 
              color: 'var(--text-muted)', 
              marginBottom: '2.5rem',
              lineHeight: 1.6,
              maxWidth: '550px'
            }}>
              Experience world-class medical care with our expert team of doctors. 
              We combine cutting-edge technology with compassionate patient care to bring you the best health outcomes.
            </p>

            <div className="hero-buttons" style={{ display: 'flex', gap: '1rem' }}>
              {!user ? (
                <Link to="/book">
                  <button style={{ 
                    padding: '1rem 2rem', 
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}>
                    Book an Appointment
                  </button>
                </Link>
              ) : (
                <Link to={getDashboardPath()}>
                  <button style={{ 
                    padding: '1rem 2rem', 
                    fontSize: '1.1rem',
                    boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)'
                  }}>
                    Go to Dashboard
                  </button>
                </Link>
              )}
              <Link to="/doctors">
                <button style={{ 
                  backgroundColor: 'white',
                  color: 'var(--primary)',
                  border: '2px solid var(--primary)',
                  padding: '1rem 2rem', 
                  fontSize: '1.1rem'
                }}>
                  Meet Our Doctors
                </button>
              </Link>
            </div>
          </div>

          <div style={{ 
            flex: '1 1 400px', 
            display: 'flex', 
            justifyContent: 'center',
            position: 'relative'
          }}>
             <div style={{
               width: '100%',
               maxWidth: '500px',
               aspectRatio: '1',
               backgroundColor: 'var(--secondary)',
               borderRadius: '50%',
               position: 'absolute',
               zIndex: -1,
               top: '5%',
               right: '-5%',
               opacity: 0.6
             }}></div>
             <div className="glass-panel" style={{
               padding: '2rem',
               display: 'flex',
               flexDirection: 'column',
               gap: '1rem',
               width: '100%',
               maxWidth: '450px',
               backgroundColor: 'rgba(255,255,255,0.8)'
             }}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'white', borderRadius: '12px', boxShadow: 'var(--glass-shadow)' }}>
                  <div style={{ width: '50px', height: '50px', background: 'var(--accent)', borderRadius: '50%', display: 'flex', alignItems:'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem'}}>📅</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)'}}>Easy Scheduling</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Book appointments 24/7</div>
                  </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'white', borderRadius: '12px', boxShadow: 'var(--glass-shadow)' }}>
                  <div style={{ width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems:'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem'}}>👨‍⚕️</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)'}}>Expert Consultations</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Top specialists in the area</div>
                  </div>
               </div>
               <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'white', borderRadius: '12px', boxShadow: 'var(--glass-shadow)' }}>
                  <div style={{ width: '50px', height: '50px', background: 'var(--text)', borderRadius: '50%', display: 'flex', alignItems:'center', justifyContent: 'center', color: 'white', fontSize: '1.5rem'}}>❤️</div>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text)'}}>Patient-First Care</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Compassionate staff</div>
                  </div>
               </div>
             </div>
          </div>
        </section>

        {/* Milestones Section */}
        <section className="section-padding" style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '2rem',
          textAlign: 'center'
        }}>
          {[
            { label: 'Happy Patients', value: '15k+' },
            { label: 'Expert Doctors', value: '150+' },
            { label: 'Certifications', value: '25+' },
            { label: 'Years Experience', value: '12+' }
          ].map((stat, i) => (
            <div key={i}>
              <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '0.5rem' }}>{stat.value}</h2>
              <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</p>
            </div>
          ))}
        </section>
      </div>

      {/* About Us Section */}
      <section id="about" className="bg-light section-padding">
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '4rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 450px' }}>
            <img 
              src={aboutImg} 
              alt="About MedicareClinic" 
              style={{ width: '100%', borderRadius: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }} 
            />
          </div>
          <div style={{ flex: '1 1 500px' }}>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '1.5rem', color: 'var(--text)' }}>
              Committed to <span style={{ color: 'var(--primary)' }}>Excellence</span> in Healthcare
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: '2rem' }}>
              At MedicareClinic, we believe that healthcare should be accessible, professional, and compassionate. 
              Founded in 2012, our mission has been to provide top-tier medical services using the latest 
              technological advancements. Our facility is equipped with state-of-the-art diagnostic tools 
              and is home to some of the most renowned specialists in the country.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>✓</span>
                <span style={{ fontWeight: 600 }}>Advanced Diagnostics</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>✓</span>
                <span style={{ fontWeight: 600 }}>Emergency 24/7 Care</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>✓</span>
                <span style={{ fontWeight: 600 }}>Expert Specialists</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ color: 'var(--primary)', fontWeight: 800 }}>✓</span>
                <span style={{ fontWeight: 600 }}>Patient Education</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Feedback Section */}
      <FeedbackSection />

      {/* Footer */}
      <footer style={{ backgroundColor: '#1e293b', color: 'white', padding: '5rem 0 2rem 0' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '3rem', marginBottom: '4rem' }}>
            <div style={{ flex: '1 1 300px' }}>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '1.5rem' }}>Medicare<span style={{ color: 'var(--primary)' }}>Clinic</span></h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
                Providing world-class medical services with a heart. Your health and well-being are our top priorities.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Quick Links</h4>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <Link to="/" style={{ color: '#94a3b8', textDecoration: 'none' }}>Home</Link>
                <Link to="/doctors" style={{ color: '#94a3b8', textDecoration: 'none' }}>Meet Our Doctors</Link>
                <button onClick={() => document.getElementById('about').scrollIntoView({ behavior: 'smooth' })} style={{ color: '#94a3b8', background: 'none', border: 'none', padding: 0, textAlign: 'left', cursor: 'pointer', fontSize: '1rem' }}>About Us</button>
                <Link to="/book" style={{ color: '#94a3b8', textDecoration: 'none' }}>Book Appointment</Link>
              </nav>
            </div>
            <div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem' }}>Contact Info</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', color: '#94a3b8' }}>
                <div>📍 123 Healthcare Way, Medical City</div>
                <div>📞 +1 (555) 123-4567</div>
                <div>✉️ contact@medicareclinic.com</div>
              </div>
            </div>
          </div>
          <div style={{ borderTop: '1px solid #334155', paddingTop: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            © {new Date().getFullYear()} MedicareClinic. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
