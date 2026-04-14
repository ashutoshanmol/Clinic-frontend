import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const HealthTips = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/blog');
        setTips(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching health tips', err);
        setLoading(false);
      }
    };
    fetchTips();
  }, []);

  return (
    <div className="container" style={{ padding: '4rem 0', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <h1 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text)', marginBottom: '1rem' }}>
          Health & Wellness Tips
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', maxWidth: '600px', margin: '0 auto' }}>
          Explore expert medical advice, healthy lifestyle guidelines, and the latest healthcare news directly from our specialists.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
          Loading latest articles...
        </div>
      ) : tips.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '4rem' }}>
          No health tips published yet. Check back later!
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2.5rem' }}>
          {tips.map((tip, index) => (
            <Link 
              to={`/health-tips/${tip._id}`} 
              key={tip._id}
              className="blog-card"
              style={{
                textDecoration: 'none',
                backgroundColor: 'var(--card-bg)',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                animation: `fadeInUp 0.6s ease forwards ${index * 0.1}s`,
                opacity: 0,
                transform: 'translateY(20px)'
              }}
            >
              <div style={{ height: '200px', backgroundColor: '#e2e8f0', backgroundImage: `url(${tip.image || 'https://via.placeholder.com/400x200?text=Health+Tip'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                {!tip.image && <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>🩺</div>}
              </div>
              <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {new Date(tip.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <h3 style={{ fontSize: '1.4rem', color: 'var(--text)', marginBottom: '1rem', fontWeight: 700, lineHeight: '1.3' }}>
                  {tip.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '1rem', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                  {tip.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', color: 'var(--text)' }}>
                      👨‍⚕️
                    </div>
                    <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)' }}>{tip.author}</span>
                  </div>
                  <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.9rem' }}>Read Article →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }
        .blog-card:hover {
          transform: translateY(-8px) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
      `}} />
    </div>
  );
};

export default HealthTips;
