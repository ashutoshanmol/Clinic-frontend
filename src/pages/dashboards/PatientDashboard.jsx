import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PatientDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
  
  // Dashboard Data
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Booking Form Data
  const [availableDoctors, setAvailableDoctors] = useState([]);
  const [bookingForm, setBookingForm] = useState({ doctor: '', date: '', time: '', symptoms: '', paymentMethod: 'Cash' });
  const [bookingErrors, setBookingErrors] = useState({});
  const [bookingLoading, setBookingLoading] = useState(false);

  // Profile Edit Data
  const [editData, setEditData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    age: user.age || '',
    gender: user.gender || '',
    bloodGroup: user.bloodGroup || '',
    address: user.address || '',
    profilePhoto: user.profilePhoto || ''
  });
  const [editErrors, setEditErrors] = useState({});
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
    fetchDoctors();
  }, [user.email]);

  const fetchDashboardData = async () => {
    try {
      if (!user.email) return;
      const res = await axios.get(`/api/patient/dashboard?email=${encodeURIComponent(user.email)}`);
      setAppointments(res.data.appointments);
      setPrescriptions(res.data.prescriptions);
      setInvoices(res.data.invoices);
      setStats(res.data.stats);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setLoading(false);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/patient/doctors');
      setAvailableDoctors(res.data);
    } catch (err) {
      console.error('Error fetching doctors:', err);
    }
  };

  const handleCancelAppointment = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await axios.patch(`/api/patient/appointments/${id}/cancel`, { email: user.email });
      alert('Appointment cancelled successfully');
      fetchDashboardData();
    } catch (err) {
      alert('Failed to cancel appointment');
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!bookingForm.doctor) errors.doctor = "Doctor is required";
    if (!bookingForm.date) errors.date = "Date is required";
    if (!bookingForm.time) errors.time = "Time is required";
    if (!bookingForm.symptoms.trim()) errors.symptoms = "Symptoms are required";
    setBookingErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setBookingLoading(true);
    try {
      const selectedDoc = availableDoctors.find(d => d.name === bookingForm.doctor);
      const amount = selectedDoc ? selectedDoc.consultationFee : 500;

      const payload = {
        patientName: user.name,
        patientEmail: user.email,
        phone: user.phone || 'N/A',
        doctor: bookingForm.doctor,
        specialty: selectedDoc ? selectedDoc.specialty : 'General',
        date: bookingForm.date,
        time: bookingForm.time,
        symptoms: bookingForm.symptoms,
        paymentMethod: bookingForm.paymentMethod
      };

      if (bookingForm.paymentMethod === 'Online') {
        const orderRes = await axios.post('/api/public/razorpay/order', { amount });
        const { id: order_id, currency } = orderRes.data;

        // Simulator Fallback
        if (order_id.startsWith('order_mock_')) {
          alert('Demo Mode: Using Razorpay Payment Simulator (To use real Razorpay, update .env keys)');
          setBookingLoading(true);
          setTimeout(async () => {
            try {
              await axios.post('/api/public/razorpay/verify', {
                razorpay_order_id: order_id,
                razorpay_payment_id: `pay_mock_${Date.now()}`,
                razorpay_signature: 'mock_signature',
                appointmentData: payload
              });
              alert('Mock Payment Successful & Appointment Confirmed!');
              setBookingForm({ doctor: '', date: '', time: '', symptoms: '', paymentMethod: 'Cash' });
              fetchDashboardData();
              setActiveTab('My Appointments');
            } catch (err) {
              alert('Payment Verification Failed!');
            }
            setBookingLoading(false);
          }, 1500);
          return;
        }

        const res = await loadRazorpayScript();
        if (!res) {
          alert("Razorpay SDK failed to load. Are you online?");
          setBookingLoading(false);
          return;
        }

        const options = {
          key: "rzp_test_6N66N66N6N66N",
          amount: amount * 100,
          currency: currency,
          name: "MediCare Clinic",
          description: `Appointment with Dr. ${bookingForm.doctor}`,
          order_id: order_id,
          handler: async (response) => {
            try {
              await axios.post('/api/public/razorpay/verify', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                appointmentData: payload
              });
              alert('Payment Successful & Appointment Confirmed!');
              setBookingForm({ doctor: '', date: '', time: '', symptoms: '', paymentMethod: 'Cash' });
              fetchDashboardData();
              setActiveTab('My Appointments');
            } catch (err) {
              alert('Payment verification failed.');
            }
          },
          prefill: {
            name: user.name,
            email: user.email,
            contact: user.phone
          },
          theme: { color: "#0284c7" }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
        setBookingLoading(false);
      } else {
        await axios.post('/api/public/appointments', payload);
        alert('Appointment request submitted successfully!');
        setBookingForm({ doctor: '', date: '', time: '', symptoms: '', paymentMethod: 'Cash' });
        fetchDashboardData();
        setActiveTab('My Appointments');
        setBookingLoading(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error booking appointment');
      setBookingLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editData.name.trim()) errors.name = "Name is required";
    if (editData.phone && !editData.phone.match(/^\+?[\d\s-]{10,}$/)) errors.phone = "Invalid phone format";
    setEditErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setUpdateLoading(true);
    try {
      const res = await axios.put(`/api/public/profile/${user.email}`, editData);
      const updatedUser = { ...user, ...res.data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert('Profile updated successfully!');
    } catch (err) {
      alert('Failed to update profile.');
    } finally {
      setUpdateLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditData({ ...editData, profilePhoto: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- PDF GENERATION LOGIC ---
  const printPrescription = (presc) => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Prescription - Dr. ${presc.doctorName}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            .header { border-bottom: 3px solid #0284c7; padding-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; }
            .clinic-brand h1 { margin: 0; color: #0284c7; font-size: 28px; letter-spacing: -0.5px; }
            .clinic-brand p { margin: 5px 0 0 0; font-size: 14px; color: #64748b; font-weight: 500; }
            .doc-info { text-align: right; }
            .doc-info h2 { margin: 0; font-size: 20px; color: #0f172a; }
            .doc-info p { margin: 2px 0; font-size: 14px; color: #64748b; }
            .patient-box { background: #f8fafc; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px; margin-bottom: 30px; display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
            .patient-box div { font-size: 15px; }
            .rx { font-size: 42px; font-weight: 800; color: #0284c7; font-family: serif; margin-bottom: 20px; line-height: 1; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px 15px; background: #f1f5f9; color: #334155; font-size: 14px; border-bottom: 2px solid #cbd5e1; }
            td { padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 15px; color: #334155; }
            .med-name { font-weight: 700; color: #0f172a; display: block; margin-bottom: 4px; }
            .med-inst { font-size: 13px; color: #64748b; }
            .notes-box { margin-bottom: 30px; padding: 15px; background: #fffcf2; border-left: 4px solid #f59e0b; border-radius: 4px; }
            .sig-area { margin-top: 60px; display: flex; justify-content: flex-end; }
            .sig-line { width: 200px; border-top: 1px solid #1e293b; text-align: center; padding-top: 8px; }
            .sig-line h4 { margin: 0; font-size: 16px; color: #0f172a; }
            .sig-line p { margin: 0; font-size: 12px; color: #64748b; }
            .footer { margin-top: 40px; text-align: center; border-top: 1px solid #e2e8f0; padding-top: 20px; font-size: 12px; color: #94a3b8; }
            @media print { body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-brand">
              <h1>MediCare Clinic</h1>
              <p>Advanced Multispecialty Care</p>
            </div>
            <div class="doc-info">
              <h2>Dr. ${presc.doctorName}</h2>
              <p>Medical Consultant</p>
              <p style="margin-top: 8px; font-weight: 600; color: #0284c7;">Date: ${new Date(presc.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="patient-box">
            <div><strong>Patient Name:</strong> ${user.name || 'Patient'}</div>
            <div><strong>Age:</strong> ${user.age || '--'} &nbsp; | &nbsp; <strong>Gender:</strong> ${user.gender || '--'}</div>
            <div style="grid-column: 1 / -1;"><strong>Contact:</strong> ${user.email} &nbsp; | &nbsp; <strong>Phone:</strong> ${user.phone || '--'}</div>
          </div>
          
          <div class="rx">Rx</div>
          
          <table>
            <thead>
              <tr>
                <th style="width: 45%;">Medicine</th>
                <th style="width: 25%;">Dosage</th>
                <th style="width: 30%;">Duration</th>
              </tr>
            </thead>
            <tbody>
              ${presc.medicines.map(m => `
                <tr>
                  <td>
                    <span class="med-name">${m.name}</span>
                    <span class="med-inst">${m.instructions || ''}</span>
                  </td>
                  <td style="font-weight: 500;">${m.dosage}</td>
                  <td>${m.duration}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          ${presc.testRecommendations ? `
            <div class="notes-box" style="border-color: #3b82f6; background: #eff6ff;">
              <strong style="color: #1d4ed8;">Recommended Lab Tests:</strong><br/>
              <span style="color: #1e40af;">${presc.testRecommendations}</span>
            </div>
          ` : ''}
          
          ${presc.notes ? `
            <div class="notes-box">
              <strong style="color: #b45309;">Clinical Notes / Diagnosis:</strong><br/>
              <span style="color: #92400e;">${presc.notes}</span>
            </div>
          ` : ''}
          
          <div class="sig-area">
            <div class="sig-line">
              <h4>Dr. ${presc.doctorName}</h4>
              <p>Digitally Authorized Signature</p>
            </div>
          </div>
          
          <div class="footer">
            This is an electronically generated official medical document.<br/>
            Always consult your physician before discontinuing any prescribed medications.
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = function() { printWindow.focus(); printWindow.print(); };
  };

  const printInvoice = (inv) => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <html>
        <head>
          <title>Invoice - ${inv._id || 'Billing'}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #1e293b; max-width: 800px; margin: 0 auto; line-height: 1.6; }
            .header { border-bottom: 2px solid #0f172a; padding-bottom: 20px; display: flex; justify-content: space-between; margin-bottom: 40px; }
            .header-left h1 { margin: 0; color: #0f172a; font-size: 32px; }
            .header-right { text-align: right; }
            .header-right h2 { color: #0284c7; font-size: 24px; margin: 0; letter-spacing: 2px; text-transform: uppercase; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; padding: 20px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; }
            .info-box h3 { margin: 0 0 10px 0; color: #64748b; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; }
            .info-box p { margin: 5px 0; font-size: 15px; font-weight: 500; }
            .table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            .table th { padding: 15px; background: #0f172a; color: white; text-align: left; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
            .table td { padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 16px; }
            .totals { display: flex; justify-content: flex-end; margin-bottom: 40px; }
            .total-box { width: 300px; border-top: 2px solid #0f172a; padding-top: 10px; }
            .total-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 16px; }
            .total-final { font-size: 24px; font-weight: 800; color: #0284c7; border-top: 1px solid #e2e8f0; padding-top: 15px; margin-top: 10px; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 700; color: white; background: ${inv.status === 'Paid' ? '#10b981' : inv.status === 'Cancelled' ? '#ef4444' : '#f59e0b'}; }
            .footer { text-align: center; border-top: 1px solid #e2e8f0; padding-top: 30px; font-size: 14px; color: #64748b; }
            @media print { body { padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <h1>MediCare Clinic</h1>
              <p style="margin: 5px 0; color: #64748b;">123 Health Ave, Medical District<br/>contact@medicare.com | +1 234 567 8900</p>
            </div>
            <div class="header-right">
              <h2>INVOICE</h2>
              <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(inv.createdAt).toLocaleDateString()}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> <span class="status-badge">${inv.status}</span></p>
            </div>
          </div>
          
          <div class="info-grid">
            <div class="info-box">
              <h3>Billed To</h3>
              <p style="font-size: 18px; color: #0284c7; font-weight: 700;">${user.name || 'Patient'}</p>
              <p>${user.email}</p>
              <p>${user.address || 'Address not provided'}</p>
            </div>
            <div class="info-box">
              <h3>Service Provided By</h3>
              <p style="font-weight: 700; color: #0f172a;">Dr. ${inv.doctorName}</p>
              <p>Consultation Services</p>
            </div>
          </div>
          
          <table class="table">
            <thead>
              <tr>
                <th>Description</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Medical Consultation & Services</td>
                <td style="text-align: right; font-weight: 600;">$${parseFloat(inv.amount).toFixed(2)}</td>
              </tr>
              <tr>
                <td style="color: #64748b; font-size: 14px; padding-top: 5px;">Includes initial assessment and general examination</td>
                <td></td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-box">
              <div class="total-row"><span>Subtotal:</span> <span>$${parseFloat(inv.amount).toFixed(2)}</span></div>
              <div class="total-row"><span>Tax (0%):</span> <span>$0.00</span></div>
              <div class="total-row total-final"><span>Total:</span> <span>$${parseFloat(inv.amount).toFixed(2)}</span></div>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing MediCare Clinic. Wishing you a swift recovery.</p>
            <p style="font-size: 12px; margin-top: 10px;">This is a system generated document.</p>
          </div>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = function() { printWindow.focus(); printWindow.print(); };
  };

  const inputStyle = { width: '100%', padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)', marginBottom: '1rem', backgroundColor: 'var(--bg-color)', color: 'var(--text)' };

  const renderTabButton = (name, icon) => (
    <button 
      onClick={() => setActiveTab(name)}
      style={{
        padding: '0.8rem 1.2rem', backgroundColor: activeTab === name ? 'var(--primary)' : 'transparent',
        color: activeTab === name ? 'white' : 'var(--text-muted)', border: 'none', borderRadius: '8px',
        fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', whiteSpace: 'nowrap'
      }}
    >
      <span>{icon}</span> {name}
    </button>
  );

  return (
    <div className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
      
      {/* Header Profile Area */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem', marginBottom: '2rem', padding: '2rem', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '3px solid var(--primary)' }}>
            {user.profilePhoto ? <img src={user.profilePhoto} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '2rem' }}>👤</span>}
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>{user.name || 'Patient'}</h1>
            <p style={{ color: 'var(--text-muted)' }}>{user.email}</p>
          </div>
        </div>
        <div>
          <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={{ padding: '0.6rem 1.2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px' }}>Sign Out</button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {renderTabButton('Overview', '📊')}
        {renderTabButton('Book Appointment', '➕')}
        {renderTabButton('My Appointments', '📅')}
        {renderTabButton('Prescriptions & History', '💊')}
        {renderTabButton('Billing', '💳')}
        {renderTabButton('Profile', '⚙️')}
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading records...</div>
      ) : (
        <>
          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && stats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-panel" style={{ padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
                <div style={{ color: 'var(--primary)', fontSize: '2rem', marginBottom: '1rem' }}>📅</div>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Upcoming Appointment</h3>
                {stats.nextAppointment ? (
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text)' }}>{stats.nextAppointment.date}</div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>at {stats.nextAppointment.time} with Dr. {stats.nextAppointment.doctor}</div>
                  </div>
                ) : <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text)' }}>No upcoming appointments</div>}
              </div>
              
              <div className="glass-panel" style={{ padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
                <div style={{ color: '#10b981', fontSize: '2rem', marginBottom: '1rem' }}>🏥</div>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Total Visits</h3>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{stats.totalVisits}</div>
                {stats.lastVisit && <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Last visited Dr. {stats.lastVisit.doctor}</div>}
              </div>

              <div className="glass-panel" style={{ padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
                <div style={{ color: '#8b5cf6', fontSize: '2rem', marginBottom: '1rem' }}>📋</div>
                <h3 style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Active Prescriptions</h3>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>{stats.activePrescriptionsCount}</div>
              </div>
            </div>
          )}

          {/* BOOK APPOINTMENT TAB */}
          {activeTab === 'Book Appointment' && (
            <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Request New Appointment</h2>
              <form onSubmit={handleBookAppointment}>
                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Select Doctor</label>
                <select style={{...inputStyle, marginBottom: '0.2rem'}} value={bookingForm.doctor} onChange={e => setBookingForm({...bookingForm, doctor: e.target.value})}>
                  <option value="">-- Choose a Specialist --</option>
                  {availableDoctors.map(doc => <option key={doc._id} value={doc.name}>Dr. {doc.name} ({doc.specialty})</option>)}
                </select>
                {bookingErrors.doctor && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginBottom: '1rem' }}>{bookingErrors.doctor}</span>}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Date</label>
                    <input type="date" min={new Date().toISOString().split('T')[0]} style={{...inputStyle, marginBottom: '0.2rem'}} value={bookingForm.date} onChange={e => setBookingForm({...bookingForm, date: e.target.value})} />
                    {bookingErrors.date && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{bookingErrors.date}</span>}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Time</label>
                    <input type="time" style={{...inputStyle, marginBottom: '0.2rem'}} value={bookingForm.time} onChange={e => setBookingForm({...bookingForm, time: e.target.value})} />
                    {bookingErrors.time && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{bookingErrors.time}</span>}
                  </div>
                </div>

                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Symptoms / Reason for Visit</label>
                <textarea rows="4" style={{...inputStyle, resize: 'vertical', marginBottom: '0.2rem'}} placeholder="Briefly describe your problem..." value={bookingForm.symptoms} onChange={e => setBookingForm({...bookingForm, symptoms: e.target.value})}></textarea>
                {bookingErrors.symptoms && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{bookingErrors.symptoms}</span>}
                
                <div style={{ marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text)' }}>Payment Option</label>
                  <div style={{ display: 'flex', gap: '1.5rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" value="Cash" checked={bookingForm.paymentMethod === 'Cash'} onChange={e => setBookingForm({...bookingForm, paymentMethod: e.target.value})} style={{ accentColor: 'var(--primary)', cursor: 'pointer', transform: 'scale(1.2)' }} />
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>Pay at Clinic</span>
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                      <input type="radio" value="Online" checked={bookingForm.paymentMethod === 'Online'} onChange={e => setBookingForm({...bookingForm, paymentMethod: e.target.value})} style={{ accentColor: 'var(--primary)', cursor: 'pointer', transform: 'scale(1.2)' }} />
                      <span style={{ color: 'var(--text)', fontWeight: 500 }}>Pay Online Now</span>
                    </label>
                  </div>
                </div>

                <button type="submit" disabled={bookingLoading} style={{ padding: '1rem', width: '100%', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 700, fontSize: '1.1rem', border: 'none', cursor: 'pointer' }}>
                  {bookingLoading ? 'Requesting...' : (bookingForm.paymentMethod === 'Online' ? 'Pay & Book' : 'Submit Request')}
                </button>
              </form>
            </div>
          )}

          {/* MY APPOINTMENTS TAB */}
          {activeTab === 'My Appointments' && (
            <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '700px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Doctor & Specialty</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date & Time</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No appointments found.</td></tr> : appointments.map(apt => (
                    <tr key={apt._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text)' }}>
                        <div style={{ fontWeight: 600 }}>Dr. {apt.doctor}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{apt.specialty}</div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text)', fontWeight: 500 }}>{apt.date} at {apt.time}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: apt.status === 'Confirmed' || apt.status === 'Completed' ? 'rgba(16, 185, 129, 0.1)' : apt.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: apt.status === 'Confirmed' || apt.status === 'Completed' ? '#10b981' : apt.status === 'Cancelled' ? '#ef4444' : '#f59e0b' }}>
                          {apt.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        {(apt.status === 'Pending' || apt.status === 'Confirmed') && (
                          <button onClick={() => handleCancelAppointment(apt._id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px', cursor: 'pointer' }}>Cancel</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PRESCRIPTIONS & HISTORY TAB */}
          {activeTab === 'Prescriptions & History' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
               {prescriptions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No medical history available.</p> : prescriptions.map(presc => (
                 <div key={presc._id} className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)', borderLeft: '4px solid var(--primary)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                     <div>
                       <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text)' }}>Dr. {presc.doctorName}</div>
                       <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(presc.createdAt).toLocaleDateString()}</div>
                     </div>
                     <button onClick={() => printPrescription(presc)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--secondary)', color: 'var(--text)', cursor: 'pointer' }}>Generate PDF</button>
                   </div>
                   
                   {presc.testRecommendations && (
                     <div style={{ marginBottom: '1rem', padding: '0.8rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: '#d97706', borderRadius: '6px', fontSize: '0.9rem' }}>
                       <strong>🩺 Recommended Lab Tests: </strong> {presc.testRecommendations}
                     </div>
                   )}
                   
                   <div style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                     <h4 style={{ marginBottom: '0.5rem', color: 'var(--text)', fontSize: '0.95rem' }}>Medicines Prescribed:</h4>
                     <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: '0.5rem' }}>
                       {presc.medicines.map((med, idx) => (
                         <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '0.5rem', borderBottom: '1px solid var(--border-color)' }}>
                           <span style={{ fontWeight: 600, color: 'var(--primary)' }}>{med.name}</span>
                           <span style={{ color: 'var(--text)' }}>{med.dosage} for {med.duration} <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>({med.instructions || 'No special instructions'})</span></span>
                         </li>
                       ))}
                     </ul>
                   </div>
                   
                   {presc.notes && (
                     <div style={{ marginTop: '1rem', color: 'var(--text)' }}>
                       <strong>Diagnosis / Notes:</strong> <span style={{ color: 'var(--text-muted)' }}>{presc.notes}</span>
                     </div>
                   )}
                 </div>
               ))}
            </div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'Billing' && (
            <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)', overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Billed By</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Amount</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)' }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text-muted)', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.length === 0 ? <tr><td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No invoices currently generated.</td></tr> : invoices.map(inv => (
                    <tr key={inv._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '1rem', color: 'var(--text)' }}>{new Date(inv.createdAt).toLocaleDateString()}</td>
                      <td style={{ padding: '1rem', color: 'var(--text)' }}>Dr. {inv.doctorName}</td>
                      <td style={{ padding: '1rem', color: 'var(--text)', fontWeight: 700 }}>${inv.amount.toFixed(2)}</td>
                      <td style={{ padding: '1rem' }}>
                         <span style={{ padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600, backgroundColor: inv.status === 'Paid' ? 'rgba(16, 185, 129, 0.1)' : inv.status === 'Cancelled' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)', color: inv.status === 'Paid' ? '#10b981' : inv.status === 'Cancelled' ? '#ef4444' : '#f59e0b' }}>
                           {inv.status}
                         </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button onClick={() => printInvoice(inv)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', border: '1px solid var(--border-color)', borderRadius: '6px', backgroundColor: 'var(--secondary)', color: 'var(--text)', cursor: 'pointer' }}>Print Invoice</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PROFILE SETTINGS TAB */}
          {activeTab === 'Profile' && (
            <div className="glass-panel" style={{ maxWidth: '600px', margin: '0 auto', padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Update Profile</h2>
              <form onSubmit={handleUpdateProfile}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                  <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', border: '2px solid var(--border-color)', marginBottom: '1rem' }}>
                    {editData.profilePhoto ? <img src={editData.profilePhoto} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ width: '100%', height: '100%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>}
                  </div>
                  <label style={{ fontSize: '0.85rem', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                    Change Photo
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </label>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                   <div>
                     <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Full Name</label>
                     <input style={{...inputStyle, marginBottom: '0.2rem'}} value={editData.name} onChange={e => setEditData({...editData, name: e.target.value})} />
                     {editErrors.name && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{editErrors.name}</span>}
                   </div>
                   <div>
                     <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Phone</label>
                     <input style={{...inputStyle, marginBottom: '0.2rem'}} value={editData.phone} onChange={e => setEditData({...editData, phone: e.target.value})} />
                     {editErrors.phone && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{editErrors.phone}</span>}
                   </div>
                   <div><label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Age</label><input type="number" style={inputStyle} value={editData.age} onChange={e => setEditData({...editData, age: e.target.value})} /></div>
                   <div><label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Gender</label>
                     <select style={inputStyle} value={editData.gender} onChange={e => setEditData({...editData, gender: e.target.value})}>
                       <option value="">Select</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
                     </select>
                   </div>
                </div>

                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Blood Group</label>
                <input style={inputStyle} value={editData.bloodGroup} onChange={e => setEditData({...editData, bloodGroup: e.target.value})} placeholder="O+" />

                <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Address</label>
                <textarea rows="3" style={{...inputStyle, resize: 'vertical'}} value={editData.address} onChange={e => setEditData({...editData, address: e.target.value})}></textarea>

                <button type="submit" disabled={updateLoading} style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '8px', fontWeight: 700, border: 'none', cursor: 'pointer', marginTop: '1rem' }}>
                  {updateLoading ? 'Saving...' : 'Save Profile Details'}
                </button>
              </form>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default PatientDashboard;
