import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API = '/api/public';

// --- Star Rating Component ---
const StarRating = ({ value, onChange, readOnly = false, size = 28 }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: 'flex', gap: '4px', cursor: readOnly ? 'default' : 'pointer' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = readOnly ? star <= value : star <= (hovered || value);
        return (
          <svg
            key={star}
            width={size} height={size}
            viewBox="0 0 24 24"
            fill={filled ? '#f59e0b' : 'none'}
            stroke={filled ? '#f59e0b' : '#d1d5db'}
            strokeWidth="1.5"
            style={{ transition: 'all 0.15s ease', transform: (!readOnly && hovered === star) ? 'scale(1.2)' : 'scale(1)' }}
            onMouseEnter={() => !readOnly && setHovered(star)}
            onMouseLeave={() => !readOnly && setHovered(0)}
            onClick={() => !readOnly && onChange && onChange(star)}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        );
      })}
    </div>
  );
};

// --- Single Review Card ---
const ReviewCard = ({ fb }) => (
  <div style={{
    background: 'white',
    borderRadius: '20px',
    padding: '1.75rem',
    boxShadow: '0 4px 24px rgba(2,132,199,0.08)',
    border: '1px solid #e0f2fe',
    width: '320px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.03)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(2,132,199,0.18)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(2,132,199,0.08)'; }}
  >
    {/* Top row: avatar + name */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
      <div style={{
        width: '46px', height: '46px', borderRadius: '50%', flexShrink: 0,
        background: `hsl(${(fb.name.charCodeAt(0) * 37) % 360}, 65%, 55%)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontWeight: 800, fontSize: '1.15rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        {fb.name.charAt(0).toUpperCase()}
      </div>
      <div>
        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{fb.name}</div>
        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
          {fb.role} · {new Date(fb.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </div>
    </div>

    {/* Stars */}
    <StarRating value={fb.rating} readOnly size={18} />

    {/* Message */}
    <p style={{
      color: '#475569',
      lineHeight: 1.7,
      fontSize: '0.9rem',
      fontStyle: 'italic',
      margin: 0,
      display: '-webkit-box',
      WebkitLineClamp: 4,
      WebkitBoxOrient: 'vertical',
      overflow: 'hidden'
    }}>
      "{fb.message}"
    </p>
  </div>
);

// --- Marquee Component ---
const ReviewMarquee = ({ feedbacks }) => {
  const trackRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // Duplicate items so it loops seamlessly
  const items = feedbacks.length > 0 ? [...feedbacks, ...feedbacks] : [];

  return (
    <div style={{ overflow: 'hidden', position: 'relative', width: '100%' }}>
      {/* Left fade */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
        background: 'linear-gradient(to right, #f8fafc, transparent)', pointerEvents: 'none'
      }} />
      {/* Right fade */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: '80px', zIndex: 2,
        background: 'linear-gradient(to left, #f8fafc, transparent)', pointerEvents: 'none'
      }} />

      <div
        ref={trackRef}
        style={{
          display: 'flex',
          gap: '1.5rem',
          width: 'max-content',
          animation: `marqueeScroll 35s linear infinite`,
          animationPlayState: isPaused ? 'paused' : 'running',
          padding: '1rem 0.5rem',
        }}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {items.map((fb, i) => (
          <ReviewCard key={`${fb._id || i}-${i}`} fb={fb} />
        ))}
      </div>
    </div>
  );
};

// --- Main Section ---
const FeedbackSection = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 0, message: '' });
  const [formErrors, setFormErrors] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get(`${API}/feedback`);
      setFeedbacks(res.data);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    
    const errors = {};
    if (!form.name.trim()) errors.name = "Name is required";
    if (form.rating === 0) errors.rating = "Rating is required";
    if (!form.message.trim()) errors.message = "Message is required";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    
    setSubmitting(true);
    try {
      await axios.post(`${API}/feedback`, form);
      setSuccess('🎉 Thank you! Your review is now live.');
      setForm({ name: '', rating: 0, message: '' });
      fetchFeedbacks();
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((s, f) => s + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  return (
    <section id="feedback" style={{ padding: '6rem 0', background: '#f8fafc', overflow: 'hidden' }}>

      {/* ── Section Header ── */}
      <div className="container" style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.75rem' }}>
          What Our <span style={{ color: '#0284c7' }}>Patients Say</span>
        </h2>
        <p style={{ color: '#64748b', fontSize: '1.05rem', marginBottom: '1.5rem' }}>
          Real feedback from our community — submitted and shown live.
        </p>
        {avgRating && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', background: 'white', padding: '0.6rem 1.4rem', borderRadius: '50px', boxShadow: '0 4px 16px rgba(2,132,199,0.12)', border: '1px solid #e0f2fe' }}>
            <StarRating value={Math.round(avgRating)} readOnly size={20} />
            <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a' }}>{avgRating}</span>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>avg · {feedbacks.length} review{feedbacks.length !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* ── Animated Marquee ── */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
          <p>Loading reviews...</p>
        </div>
      ) : feedbacks.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💬</div>
          <p style={{ fontWeight: 600 }}>No reviews yet. Be the first below!</p>
        </div>
      ) : (
        <ReviewMarquee feedbacks={feedbacks} />
      )}

      {/* ── Submission Form ── */}
      <div className="container" style={{ marginTop: '4rem' }}>
        <div style={{
          maxWidth: '560px',
          margin: '0 auto',
          background: 'white',
          borderRadius: '24px',
          padding: '2.5rem',
          boxShadow: '0 8px 40px rgba(2,132,199,0.1)',
          border: '1px solid #e0f2fe'
        }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.4rem' }}>Leave a Review ⭐</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.75rem' }}>Your feedback goes live instantly on the marquee above.</p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Name */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginBottom: '0.4rem' }}>Your Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                maxLength={100}
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem', color: '#0f172a', background: '#f8fafc', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s', marginBottom: '0.2rem' }}
                onFocus={e => e.target.style.borderColor = '#0284c7'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              {formErrors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.name}</span>}
            </div>

            {/* Star Rating picker */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginBottom: '0.6rem' }}>Your Rating *</label>
              <StarRating value={form.rating} onChange={r => setForm({ ...form, rating: r })} size={34} />
              {formErrors.rating && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.2rem' }}>{formErrors.rating}</span>}
              {form.rating > 0 && (
                <p style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#0284c7', fontWeight: 700 }}>
                  {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent!'][form.rating]}
                </p>
              )}
            </div>

            {/* Message */}
            <div>
              <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: '#334155', marginBottom: '0.4rem' }}>Your Message *</label>
              <textarea
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                placeholder="Share your experience with MedicareClinic..."
                maxLength={500}
                rows={4}
                style={{ width: '100%', padding: '0.8rem 1rem', border: '1.5px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem', color: '#0f172a', background: '#f8fafc', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit', transition: 'border-color 0.2s', marginBottom: '0.2rem' }}
                onFocus={e => e.target.style.borderColor = '#0284c7'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              {formErrors.message && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{formErrors.message}</span>}
              <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#94a3b8', marginTop: '0.25rem' }}>{form.message.length}/500</div>
            </div>

            {error && <p style={{ color: '#ef4444', fontSize: '0.88rem', fontWeight: 500, margin: 0 }}>⚠️ {error}</p>}
            {success && <p style={{ color: '#22c55e', fontSize: '0.88rem', fontWeight: 600, margin: 0 }}>{success}</p>}

            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '0.95rem 1.5rem',
                background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #0284c7, #0369a1)',
                color: 'white', border: 'none', borderRadius: '12px',
                fontSize: '1rem', fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: submitting ? 'none' : '0 4px 14px rgba(2,132,199,0.35)',
                letterSpacing: '0.3px'
              }}
              onMouseEnter={e => { if (!submitting) e.target.style.transform = 'translateY(-1px)'; }}
              onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; }}
            >
              {submitting ? '⏳ Submitting...' : '⭐ Submit Review'}
            </button>
          </form>
        </div>
      </div>

      {/* CSS keyframes */}
      <style>{`
        @keyframes marqueeScroll {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </section>
  );
};

export default FeedbackSection;
