import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Overview');
  
  // Data States
  const [stats, setStats] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [availability, setAvailability] = useState({});
  const [availabilityErrors, setAvailabilityErrors] = useState({});
  const [loading, setLoading] = useState(true);
  
  // Selected Patient Details
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchDashboardData();
  }, [user.name]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (!user.name) return;
      const [statsRes, apptRes, availRes] = await Promise.all([
        axios.get(`http://localhost:5000/api/doctor/stats?doctorName=${encodeURIComponent(user.name)}`),
        axios.get(`http://localhost:5000/api/doctor/appointments?doctorName=${encodeURIComponent(user.name)}`),
        axios.get(`http://localhost:5000/api/doctor/availability?doctorEmail=${encodeURIComponent(user.email)}`)
      ]);
      setStats(statsRes.data);
      setAppointments(apptRes.data);
      setAvailability(availRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching doctor data', err);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.patch(`http://localhost:5000/api/doctor/appointments/${id}`, { status: newStatus });
      fetchDashboardData(); // Refresh records
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const loadPatientHistory = async (patientName) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/doctor/patient/${encodeURIComponent(patientName)}`);
      setSelectedPatient({ name: patientName, ...res.data });
      setActiveTab('Patient Details');
    } catch (err) {
      alert('Failed to load patient history');
    }
  };

  const handleUpdateAvailability = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!availability.startTime) errors.startTime = "Start time is required";
    if (!availability.endTime) errors.endTime = "End time is required";
    if (!availability.workingDays || availability.workingDays.length === 0) errors.workingDays = "Select at least one working day";
    setAvailabilityErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      await axios.put('http://localhost:5000/api/doctor/availability', { 
        doctorEmail: user.email, 
        availability 
      });
      alert('Schedule updated successfully');
    } catch (err) {
      alert('Error saving schedule');
    }
  };

  // UI rendering specifics
  const renderTabButton = (name, icon) => (
    <button 
      onClick={() => setActiveTab(name)}
      style={{
        padding: '0.8rem 1.2rem',
        backgroundColor: activeTab === name ? 'var(--primary)' : 'transparent',
        color: activeTab === name ? 'white' : 'var(--text-muted)',
        border: 'none',
        borderRadius: '8px',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'all 0.2s'
      }}
    >
      <span>{icon}</span> {name}
    </button>
  );

  return (
    <div className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
      
      {/* Header Profile Area */}
      <div style={{ 
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '2rem',
        marginBottom: '2rem', padding: '2rem', backgroundColor: 'var(--card-bg)', borderRadius: '16px', border: '1px solid var(--border-color)'
      }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', border: '2px solid var(--primary)' }}>
            👨‍⚕️
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.25rem' }}>Dr. {user.name}</h1>
            <p style={{ color: 'var(--primary)', fontWeight: 600 }}>{user.specialty || 'Specialist'}</p>
          </div>
        </div>
        
        <div style={{ textAlign: 'left', minWidth: '150px' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 500 }}>{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</div>
          <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={{ padding: '0.6rem 1.2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px' }}>Sign Out</button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {renderTabButton('Overview', '📊')}
        {renderTabButton('Appointments', '📅')}
        {renderTabButton('Patient Details', '👥')}
        {renderTabButton('Schedule', '🕒')}
      </div>

      {/* Tab Contents */}
      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading system...</div>
      ) : (
        <>
          {activeTab === 'Overview' && stats && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#3b82f620', border: '1px solid #3b82f640' }}>
                  <div style={{ color: '#3b82f6', fontWeight: 600, marginBottom: '0.5rem' }}>Today's Appointments</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>{stats.todayCount}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#f59e0b20', border: '1px solid #f59e0b40' }}>
                  <div style={{ color: '#f59e0b', fontWeight: 600, marginBottom: '0.5rem' }}>Pending Appointments</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>{stats.pendingCount}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#10b98120', border: '1px solid #10b98140' }}>
                  <div style={{ color: '#10b981', fontWeight: 600, marginBottom: '0.5rem' }}>Completed</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>{stats.completedCount}</div>
                </div>
                <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: '#8b5cf620', border: '1px solid #8b5cf640' }}>
                  <div style={{ color: '#8b5cf6', fontWeight: 600, marginBottom: '0.5rem' }}>Total Distinct Patients</div>
                  <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)' }}>{stats.totalPatients}</div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
                {/* Graph */}
                <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Weekly Patients Pipeline</h3>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px', paddingBottom: '1rem', position: 'relative' }}>
                    {stats.weeklyGraph.map((item, idx) => {
                      const maxVal = Math.max(...stats.weeklyGraph.map(d => d.value), 1);
                      const heightPercent = `${(item.value / maxVal) * 100}%`;
                      return (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                          <div title={`${item.name}: ${item.value}`} style={{ width: '100%', maxWidth: '40px', backgroundColor: 'var(--primary)', height: heightPercent, borderTopLeftRadius: '4px', borderTopRightRadius: '4px' }}></div>
                          <div style={{ position: 'absolute', bottom: '0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.name}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {/* Quick actions/hints */}
                <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Next Pending Appointments</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {appointments.filter(a => a.status === 'Pending').slice(0, 4).map(apt => (
                      <li key={apt._id} style={{ padding: '1rem 0', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)' }}>{apt.patientName}</div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{apt.date} at {apt.time}</div>
                        </div>
                        <button onClick={() => { loadPatientHistory(apt.patientName) }} style={{ padding: '0.4rem 0.8rem', backgroundColor: 'var(--secondary)', border: '1px solid var(--border-color)', borderRadius: '6px', fontSize: '0.8rem' }}>View Profile</button>
                      </li>
                    ))}
                    {appointments.filter(a => a.status === 'Pending').length === 0 && <li style={{ color: 'var(--text-muted)' }}>No pending appointments</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Appointments' && (
            <div className="glass-panel" style={{ overflowX: 'auto', backgroundColor: 'var(--card-bg)', padding: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--text)' }}>All Appointments</h3>
              </div>
              <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--secondary)', borderBottom: '1px solid var(--border-color)' }}>
                    <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 600 }}>Date & Time</th>
                    <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 600 }}>Patient</th>
                    <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 600 }}>Status</th>
                    <th style={{ padding: '1rem', color: 'var(--text)', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr><td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No appointments found.</td></tr>
                  ) : (
                    appointments.map(apt => (
                      <tr key={apt._id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                        <td style={{ padding: '1rem', color: 'var(--text)', fontWeight: 500 }}>{apt.date} | {apt.time}</td>
                        <td style={{ padding: '1rem', color: 'var(--text)', fontWeight: 600 }}>
                          <span onClick={() => loadPatientHistory(apt.patientName)} style={{ cursor: 'pointer', color: 'var(--primary)', textDecoration: 'underline' }}>{apt.patientName}</span>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ 
                            padding: '0.3rem 0.8rem', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 600,
                            backgroundColor: apt.status === 'Completed' || apt.status === 'Confirmed' ? 'rgba(16, 185, 129, 0.1)' : apt.status === 'Pending' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                            color: apt.status === 'Completed' || apt.status === 'Confirmed' ? '#10b981' : apt.status === 'Pending' ? '#f59e0b' : '#ef4444'
                          }}>{apt.status}</span>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            {apt.status === 'Pending' && (
                              <button onClick={() => handleStatusUpdate(apt._id, 'Confirmed')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#10b981', color: 'white', borderRadius: '6px' }}>Accept</button>
                            )}
                            {apt.status === 'Confirmed' && (
                              <button onClick={() => handleStatusUpdate(apt._id, 'Completed')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px' }}>Mark Complete</button>
                            )}
                            {(apt.status === 'Pending' || apt.status === 'Confirmed') && (
                              <button onClick={() => handleStatusUpdate(apt._id, 'Cancelled')} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: '6px' }}>Reject</button>
                            )}
                            {(apt.status === 'Completed' || apt.status === 'Confirmed') && (
                              <button onClick={() => navigate(`/doctor/add-prescription?patientName=${encodeURIComponent(apt.patientName)}`)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', backgroundColor: 'var(--secondary)', color: 'var(--text)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>+ Prescribe</button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'Patient Details' && (
            <div className="glass-panel" style={{ padding: '2rem', backgroundColor: 'var(--card-bg)' }}>
              {!selectedPatient ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👤</div>
                  <p>Select a patient from the Appointments or Overview tab to view their detailed medical history and prior prescriptions.</p>
                </div>
              ) : (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--text)' }}>Patient Profile: {selectedPatient.name}</h2>
                    <button onClick={() => navigate(`/doctor/add-prescription?patientName=${encodeURIComponent(selectedPatient.name)}`)} style={{ padding: '0.6rem 1.2rem', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '6px', fontWeight: 600 }}>Create New Prescription</button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                    <div style={{ backgroundColor: 'var(--secondary)', padding: '1.5rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', color: 'var(--text)' }}>Contact Info</h3>
                      {selectedPatient.patientDetails ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                          <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Email</span><div style={{ fontWeight: 500 }}>{selectedPatient.patientDetails.email}</div></div>
                          <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Phone</span><div style={{ fontWeight: 500 }}>{selectedPatient.patientDetails.phone}</div></div>
                          <div><span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Blood Group</span><div style={{ fontWeight: 500 }}>{selectedPatient.patientDetails.bloodGroup || 'Not Provided'}</div></div>
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)' }}>Unregistered/Guest Patient.</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text)' }}>Previous Prescriptions & Diagnosis</h3>
                      {selectedPatient.prescriptions && selectedPatient.prescriptions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                          {selectedPatient.prescriptions.map(p => (
                            <div key={p._id} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1rem' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                <span style={{ fontWeight: 600, color: 'var(--primary)' }}>Dr. {p.doctorName}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{new Date(p.createdAt).toLocaleDateString()}</span>
                              </div>
                              <p style={{ fontSize: '0.9rem', color: 'var(--text)' }}><strong>Notes/Diagnosis:</strong> {p.notes || 'None'}</p>
                              {p.testRecommendations && <p style={{ fontSize: '0.9rem', color: '#f59e0b', marginTop: '0.5rem' }}><strong>Tests:</strong> {p.testRecommendations}</p>}
                              <div style={{ marginTop: '0.8rem' }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.4rem' }}>Medications:</div>
                                <ul style={{ fontSize: '0.85rem', paddingLeft: '1.2rem', color: 'var(--text)' }}>
                                  {p.medicines.map((m, i) => (
                                    <li key={i}>{m.name} - {m.dosage} for {m.duration} ({m.instructions})</li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p style={{ color: 'var(--text-muted)' }}>No prescription history found for this patient.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'Schedule' && (
            <div className="glass-panel" style={{ padding: '2rem', backgroundColor: 'var(--card-bg)', maxWidth: '600px', margin: '0 auto' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)' }}>Manage Availability</h2>
              <form onSubmit={handleUpdateAvailability}>
                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{ display: 'block', marginBottom: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>Working Days</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.8rem' }}>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <label key={day} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.4rem 0.8rem', backgroundColor: 'var(--secondary)', borderRadius: '20px', fontSize: '0.9rem', cursor: 'pointer' }}>
                        <input 
                          type="checkbox" 
                          checked={availability.workingDays?.includes(day)}
                          onChange={(e) => {
                            const newDays = e.target.checked 
                              ? [...(availability.workingDays || []), day] 
                              : (availability.workingDays || []).filter(d => d !== day);
                            setAvailability({ ...availability, workingDays: newDays });
                          }}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                  {availabilityErrors.workingDays && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block', marginTop: '0.4rem' }}>{availabilityErrors.workingDays}</span>}
                </div>
                
                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text)' }}>Start Time</label>
                    <input type="time" value={availability.startTime || ''} onChange={e => setAvailability({...availability, startTime: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)', marginBottom: '0.2rem' }} />
                    {availabilityErrors.startTime && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{availabilityErrors.startTime}</span>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: 'var(--text)' }}>End Time</label>
                    <input type="time" value={availability.endTime || ''} onChange={e => setAvailability({...availability, endTime: e.target.value})} style={{ width: '100%', padding: '0.8rem', borderRadius: '6px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-color)', color: 'var(--text)', marginBottom: '0.2rem' }} />
                    {availabilityErrors.endTime && <span style={{ color: '#ef4444', fontSize: '0.8rem', display: 'block' }}>{availabilityErrors.endTime}</span>}
                  </div>
                </div>
                
                <button type="submit" style={{ width: '100%', padding: '1rem', backgroundColor: 'var(--primary)', color: 'white', fontWeight: 700, borderRadius: '8px', border: 'none', cursor: 'pointer' }}>Save Schedule Settings</button>
              </form>
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default DoctorDashboard;
