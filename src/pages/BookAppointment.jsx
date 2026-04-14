import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const medicalSpecialties = [
  'Cardiology', 'Dermatology', 'Endocrinology', 'Gastroenterology', 'General Physician', 
  'Gynecology', 'Hematology', 'Internal Medicine', 'Nephrology', 'Neurology', 
  'Oncology', 'Ophthalmology', 'Orthopedics', 'ENT', 'Pediatrics', 
  'Psychiatry', 'Pulmonology', 'Radiology', 'Rheumatology', 'Urology', 'Dentistry'
];

const BookAppointment = () => {
  const navigate = useNavigate();
  const [status, setStatus] = useState({ loading: false, error: null });
  const [dbDoctors, setDbDoctors] = useState([]);
  const [fetchingDoctors, setFetchingDoctors] = useState(true);
  
  // Auth Check & Auto-fill
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  useEffect(() => {
    if (!user) {
      alert("Please login to book an appointment.");
      navigate('/login', { state: { from: '/book' } });
      return;
    }

    const fetchDoctors = async () => {
      try {
        const res = await axios.get('/api/public/doctors');
        setDbDoctors(res.data);
        setFetchingDoctors(false);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setFetchingDoctors(false);
      }
    };
    fetchDoctors();
  }, [user, navigate]);

  const [formData, setFormData] = useState({
    patientName: user?.name || '',
    phone: user?.phone || '',
    specialty: '',
    doctor: '',
    date: '',
    time: '',
    symptoms: '',
    paymentMethod: 'Cash'
  });
  const [formErrors, setFormErrors] = useState({});

  const times = ['09:00 AM', '10:00 AM', '11:00 AM', '01:00 PM', '02:00 PM', '04:00 PM'];

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!formData.patientName.trim()) errors.patientName = "Patient name is required";
    if (!formData.phone.match(/^\+?[\d\s-]{10,}$/)) errors.phone = "Valid phone number is required";
    if (!formData.specialty) errors.specialty = "Specialty is required";
    if (!formData.doctor) errors.doctor = "Doctor is required";
    if (!formData.date) errors.date = "Date is required";
    if (!formData.time) errors.time = "Time is required";
    
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    if (!formData.doctor || !formData.date || !formData.time) {
      setStatus({ ...status, error: "Please select a doctor, date and time." });
      return;
    }

    const selectedDoctor = dbDoctors.find(d => d.name === formData.doctor);
    const amount = selectedDoctor ? selectedDoctor.consultationFee : 500; // Default or fetched fee
    
    setStatus({ loading: true, error: null });

    if (formData.paymentMethod === 'Online') {
      try {
        // 1. Create Order
        const orderRes = await axios.post('/api/public/razorpay/order', { amount });
        const { id: order_id, currency } = orderRes.data;

        // Simulator Fallback
        if (order_id.startsWith('order_mock_')) {
          alert('Demo Mode: Using Razorpay Payment Simulator (To use real Razorpay, update .env keys)');
          setTimeout(async () => {
            try {
              await axios.post('/api/public/razorpay/verify', {
                razorpay_order_id: order_id,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: 'mock_signature',
                appointmentData: { ...formData, paymentMethod: 'Online' }
              });
              alert('Mock Payment Successful! Appointment Confirmed.');
              navigate('/dashboard/patient');
            } catch (err) {
              setStatus({ loading: false, error: "Mock verification failed." });
            }
          }, 1500);
          return;
        }

        const res = await loadRazorpayScript();
        if (!res) {
          setStatus({ loading: false, error: "Razorpay SDK failed to load. Check your connection." });
          return;
        }

        // 2. Open Razorpay Checkout
        const options = {
          key: "rzp_test_6N66N66N6N66N", // Using the test key from plan (or actual if available)
          amount: amount * 100,
          currency: currency,
          name: "MediCare Clinic",
          description: `Appointment with Dr. ${formData.doctor}`,
          order_id: order_id,
          handler: async (response) => {
            try {
              // 3. Verify Payment
              await axios.post('/api/public/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentData: { ...formData, paymentMethod: 'Online' }
              });
              
              alert(`Payment Successful! Appointment Confirmed.`);
              navigate('/dashboard/patient');
            } catch (err) {
              console.error('Verification Error:', err);
              setStatus({ loading: false, error: "Payment verification failed. Please contact support." });
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: formData.phone
          },
          theme: { color: "#0284c7" }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setStatus({ loading: false, error: null });
      } catch (err) {
        console.error('Order Error:', err);
        const errMsg = err.response?.data?.detail || err.response?.data?.message || "Error initiating online payment.";
        setStatus({ loading: false, error: errMsg });
      }
    } else {
      // Cash Payment Flow
      try {
        await axios.post('/api/public/appointments', formData);
        alert(`Appointment Confirmed! (Cash Payment - Pending)`);
        navigate('/dashboard/patient');
      } catch (err) {
        setStatus({ 
          loading: false, 
          error: err.response?.data?.message || 'Error booking appointment. Please try again.' 
        });
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
    appearance: 'none',
    backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23334155' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 1rem center',
    backgroundSize: '1em'
  };

  // When specialty changes, reset doctor if not matching
  const handleSpecialtyChange = (e) => {
    const spec = e.target.value;
    setFormData({ ...formData, specialty: spec, doctor: '' });
  };

  const filteredDoctors = formData.specialty 
    ? dbDoctors.filter(d => d.specialty === formData.specialty)
    : dbDoctors;

  return (
    <div className="container" style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '6rem', paddingTop: '2rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Appointment Booking</h1>
        <p style={{ color: 'var(--text-muted)' }}>Please provide the following details to schedule your visit</p>
      </div>

      <div className="glass-panel" style={{ padding: '2.5rem', backgroundColor: 'var(--card-bg)' }}>
        {status.error && (
          <div style={{ marginBottom: '1.5rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {status.error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Patient Name</label>
              <input type="text" style={{...inputStyle, marginBottom: 0}} value={formData.patientName} onChange={e => setFormData({...formData, patientName: e.target.value})} 
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.patientName && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{formErrors.patientName}</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Phone Number</label>
              <input type="tel" style={{...inputStyle, marginBottom: 0}} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="Enter your phone number" 
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{formErrors.phone}</span>}
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Filter by Specialty</label>
              <select style={{...selectStyle, marginBottom: 0}} value={formData.specialty} onChange={handleSpecialtyChange}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              >
                <option value="">All Specialties</option>
                {medicalSpecialties.map(spec => (
                  <option key={spec} value={spec} style={{ background: '#fff' }}>{spec}</option>
                ))}
              </select>
              {formErrors.specialty && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{formErrors.specialty}</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Select Doctor</label>
              <select 
                style={{...selectStyle, marginBottom: 0}} 
                value={formData.doctor} 
                onChange={e => setFormData({...formData, doctor: e.target.value})}
                disabled={fetchingDoctors}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              >
                <option value="" disabled>{fetchingDoctors ? 'Loading doctors...' : 'Select a doctor...'}</option>
                {filteredDoctors.map(doc => (
                  <option key={doc._id} value={doc.name} style={{ background: '#fff' }}>
                    {doc.name} ({doc.specialty})
                  </option>
                ))}
              </select>
              {formErrors.doctor && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{formErrors.doctor}</span>}
            </div>
          </div>

          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Preferred Date</label>
              <input type="date" style={{...inputStyle, marginBottom: 0}} value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} min={new Date().toISOString().split('T')[0]} 
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              />
              {formErrors.date && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{formErrors.date}</span>}
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Preferred Time</label>
              <select style={{...selectStyle, marginBottom: 0}} value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
              >
                <option value="" disabled>Select time slot...</option>
                {times.map(time => <option key={time} value={time} style={{ background: '#fff' }}>{time}</option>)}
              </select>
              {formErrors.time && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{formErrors.time}</span>}
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Payment Method</label>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Cash" 
                  checked={formData.paymentMethod === 'Cash'} 
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})} 
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer', transform: 'scale(1.2)' }}
                />
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>Cash at Clinic</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input 
                  type="radio" 
                  name="paymentMethod" 
                  value="Online" 
                  checked={formData.paymentMethod === 'Online'} 
                  onChange={e => setFormData({...formData, paymentMethod: e.target.value})} 
                  style={{ accentColor: 'var(--primary)', cursor: 'pointer', transform: 'scale(1.2)' }}
                />
                <span style={{ color: 'var(--text)', fontWeight: 500 }}>Pay Online Now</span>
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.9rem', fontWeight: 600 }}>Additional Notes / Symptoms</label>
            <textarea 
              style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} 
              value={formData.symptoms} 
              onChange={e => setFormData({...formData, symptoms: e.target.value})} 
              placeholder="Briefly describe your health concern..."
              onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
            ></textarea>
          </div>

          <button 
            type="submit" 
            disabled={status.loading || fetchingDoctors} 
            style={{ 
              width: '100%', 
              padding: '1.2rem', 
              fontSize: '1.1rem', 
              fontWeight: 600,
              backgroundColor: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              opacity: (status.loading || fetchingDoctors) ? 0.7 : 1, 
              cursor: (status.loading || fetchingDoctors) ? 'not-allowed' : 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.2)'
            }}
          >
            {status.loading ? 'Processing Your Request...' : formData.paymentMethod === 'Online' ? 'Pay & Confirm Appointment' : 'Confirm Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
