import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const HealthTipDetail = () => {
  const { id } = useParams();
  const [tip, setTip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTip = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/blog/${id}`);
        setTip(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching health tip detail', err);
        setLoading(false);
      }
    };
    fetchTip();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '6rem' }}>Loading article...</div>;
  if (!tip) return <div style={{ textAlign: 'center', padding: '6rem' }}>Article not found.</div>;

  return (
    <div className="container" style={{ padding: '4rem 0', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      
      <Link to="/health-tips" style={{ display: 'inline-flex', alignItems: 'center', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, marginBottom: '2rem', fontSize: '0.9rem' }}>
        ← Back to all Health Tips
      </Link>

      <div style={{ marginBottom: '2rem' }}>
        <div style={{ color: 'var(--primary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '1rem', fontSize: '0.9rem' }}>
          {new Date(tip.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text)', lineHeight: '1.2', marginBottom: '1.5rem', letterSpacing: '-1px' }}>
          {tip.title}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
            👨‍⚕️
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--text)' }}>{tip.author}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Medical Specialist</div>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', height: '400px', borderRadius: '16px', backgroundColor: '#e2e8f0', backgroundImage: `url(${tip.image || 'https://via.placeholder.com/800x400?text=Health+Article'})`, backgroundSize: 'cover', backgroundPosition: 'center', marginBottom: '3rem', position: 'relative', overflow: 'hidden' }}>
         {!tip.image && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem' }}>🩺</div>}
      </div>

      <div style={{ fontSize: '1.2rem', color: 'var(--text)', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
        <p style={{ fontSize: '1.4rem', color: 'var(--text-muted)', fontStyle: 'italic', marginBottom: '2rem', borderLeft: '4px solid var(--primary)', paddingLeft: '1.5rem' }}>
          {tip.description}
        </p>
        
        {tip.content}
      </div>

      <div style={{ marginTop: '5rem', padding: '3rem', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}>
        <h3 style={{ fontSize: '1.8rem', color: 'var(--text)', marginBottom: '1rem' }}>Need personalized medical advice?</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '1.1rem' }}>Our top specialists are available for consultation.</p>
        <Link to="/book" style={{ display: 'inline-block', padding: '1rem 2rem', backgroundColor: 'var(--primary)', color: 'white', textDecoration: 'none', borderRadius: '8px', fontWeight: 700, letterSpacing: '1px' }}>
          Book an Appointment
        </Link>
      </div>

    </div>
  );
};

export default HealthTipDetail;
