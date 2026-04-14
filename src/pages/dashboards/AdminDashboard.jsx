import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({ stats: [], recentActivity: [], trendsData: null });
  const [loading, setLoading] = useState(true);
  
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats');
        setStatsData(res.data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch admin stats:', err);
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // Fallback stats structure while loading or if error occurs
  const stats = statsData.stats.length > 0 ? statsData.stats : [
    { label: 'Total Patients', value: '-', icon: '👥', color: '#3b82f6' },
    { label: 'Total Doctors', value: '-', icon: '👨‍⚕️', color: '#10b981' },
    { label: 'Today\'s Appointments', value: '-', icon: '📅', color: '#8b5cf6' },
  ];

  const recentActivity = statsData.recentActivity;
  const trendsData = statsData.trendsData;

  // Render a simple CSS vertical bar chart
  const renderBarChart = (data, color, isCurrency = false) => {
    if (!data || data.length === 0) return <p style={{ color: 'var(--text-muted)' }}>No data available</p>;
    
    // Find max value to determine heights relatively
    const maxVal = Math.max(...data.map(d => d.value), 1);
    
    return (
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '180px', marginTop: '1rem', paddingBottom: '2rem', position: 'relative' }}>
        {data.map((item, idx) => {
          const heightPercent = `${(item.value / maxVal) * 100}%`;
          return (
            <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
              <div 
                title={`${item.name}: ${isCurrency ? '₹' : ''}${item.value}`}
                style={{ 
                  width: '100%', 
                  maxWidth: '40px', 
                  backgroundColor: color, 
                  height: heightPercent, 
                  borderTopLeftRadius: '4px', 
                  borderTopRightRadius: '4px',
                  transition: 'height 1s ease-out'
                }}
              ></div>
              <div style={{ position: 'absolute', bottom: '0', fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', textAlign: 'center' }}>
                {item.name}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="container" style={{ paddingBottom: '6rem', paddingTop: '2rem' }}>
      
      <div style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text)', marginBottom: '0.5rem' }}>Welcome, {user.name || 'Admin'}</h1>
          <p style={{ color: 'var(--text-muted)' }}>System Overview and Management</p>
        </div>
        <button 
          onClick={() => { localStorage.removeItem('user'); navigate('/login'); }}
          style={{ padding: '0.6rem 1.2rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}
        >
          Logout
        </button>
      </div>

      {/* KPI Stats */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', marginBottom: '3rem' }}>
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-panel" style={{ flex: '1 1 250px', padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
            <div style={{ 
              fontSize: '2.5rem', 
              width: '60px', 
              height: '60px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: `${stat.color}20`,
              borderRadius: '12px'
            }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.25rem', fontWeight: 500 }}>{stat.label}</div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text)' }}>
                {loading ? '...' : stat.value}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Analytics Charts Row */}
      {trendsData && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', marginBottom: '3rem' }}>
          <div className="glass-panel" style={{ flex: '1 1 400px', padding: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text)', fontWeight: 700 }}>Revenue Growth</h2>
            {renderBarChart(trendsData.revenueTrend, '#f59e0b', true)}
          </div>
          
          <div className="glass-panel" style={{ flex: '1 1 400px', padding: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text)', fontWeight: 700 }}>Patient Visits (Last 7 Days)</h2>
            {renderBarChart(trendsData.visitsTrend, '#3b82f6', false)}
          </div>

          <div className="glass-panel" style={{ flex: '1 1 300px', padding: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', color: 'var(--text)', fontWeight: 700 }}>Most Booked Doctors</h2>
            {trendsData.topDoctors && trendsData.topDoctors.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {trendsData.topDoctors.map((doc, idx) => {
                  const maxBooking = trendsData.topDoctors[0].count;
                  const widthPercent = `${(doc.count / maxBooking) * 100}%`;
                  return (
                    <li key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: 'var(--text)' }}>
                        <span style={{ fontWeight: 600 }}>Dr. {doc.name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{doc.count} appts</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--bg-color)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', backgroundColor: '#10b981', width: widthPercent, borderRadius: '4px' }}></div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
                <p style={{ color: 'var(--text-muted)' }}>No data available</p>
            )}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem' }}>
        
        {/* Quick Management Actions */}
        <div style={{ flex: '2 1 400px' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)', fontWeight: 700 }}>Management Tools</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            {[
              { title: 'Manage Doctors', desc: 'Add, remove, or update doctor profiles', icon: '🩺', path: '/admin/doctors' },
              { title: 'View All Patients', desc: 'Access global patient directory', icon: '🏥', path: '/admin/patients' },
              { title: 'Global Appointments', desc: 'View all scheduled clinic bookings', icon: '📅', path: '/admin/appointments' },
              { title: 'Contact Messages', desc: 'Read and respond to patient inquiries', icon: '✉️', path: '/admin/messages' },
              { title: 'Billing & Invoices', desc: 'Generate bills and track payments', icon: '💳', path: '/admin/invoices' },
              { title: 'Health Tips / Blog', desc: 'Publish and manage medical articles', icon: '📰', path: '/admin/health-tips' },
              { title: 'Admin Profile', desc: 'Update profile and security settings', icon: '⚙️', path: '/admin/profile' },
              { title: 'Manage Staff', desc: 'Add or remove clinic staff (e.g. receptionists)', icon: '👥', path: '/admin/staff' }
            ].map((tool, idx) => (
              <div key={idx} className="glass-panel" style={{ 
                padding: '1.5rem', 
                cursor: 'pointer',
                transition: 'all 0.2s',
                backgroundColor: 'var(--card-bg)'
              }}
              onClick={() => tool.path !== '#' && navigate(tool.path)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '0.8rem' }}>{tool.icon}</div>
                <h3 style={{ fontSize: '1.1rem', color: 'var(--text)', marginBottom: '0.25rem', fontWeight: 600 }}>{tool.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Activity Log */}
        <div style={{ flex: '1 1 300px' }}>
           <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--text)', fontWeight: 700 }}>Recent Activity</h2>
           <div className="glass-panel" style={{ padding: '1.5rem', backgroundColor: 'var(--card-bg)' }}>
             {loading ? (
               <p style={{ color: 'var(--text-muted)' }}>Loading activity...</p>
             ) : recentActivity.length === 0 ? (
               <p style={{ color: 'var(--text-muted)' }}>No recent activity to show.</p>
             ) : (
               <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {recentActivity.map((activity, idx) => (
                    <li key={idx} style={{ 
                      position: 'relative', 
                      paddingLeft: '1.5rem',
                      borderLeft: '2px solid var(--border-color)'
                    }}>
                      <div style={{ 
                        position: 'absolute', 
                        left: '-6px', 
                        top: '4px', 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        backgroundColor: 'var(--primary)' 
                      }}></div>
                      <div style={{ color: 'var(--text)', fontWeight: 600, fontSize: '0.95rem' }}>{activity.action}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>{activity.target}</div>
                      <div style={{ color: 'var(--border-color)', fontSize: '0.75rem' }}>{activity.time}</div>
                    </li>
                  ))}
               </ul>
             )}
           </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
