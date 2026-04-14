import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import axios from 'axios'

// Components
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import SymptomChecker from './components/SymptomChecker'

// Pages
import Home from './pages/Home'
import Doctors from './pages/Doctors'
import Services from './pages/Services'
import Contact from './pages/Contact'
import HealthTips from './pages/HealthTips'
import HealthTipDetail from './pages/HealthTipDetail'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import BookAppointment from './pages/BookAppointment'
import PatientDashboard from './pages/dashboards/PatientDashboard'
import DoctorDashboard from './pages/dashboards/DoctorDashboard'
import AddPrescription from './pages/dashboards/AddPrescription'
import AdminDashboard from './pages/dashboards/AdminDashboard'
import ManageDoctors from './pages/admin/ManageDoctors'
import ViewPatients from './pages/admin/ViewPatients'
import ViewAppointments from './pages/admin/ViewAppointments'
import ViewMessages from './pages/admin/ViewMessages'
import AdminProfile from './pages/admin/AdminProfile'
import ManageStaff from './pages/admin/ManageStaff'
import ManageInvoices from './pages/admin/ManageInvoices'
import ManageHealthTips from './pages/dashboards/ManageHealthTips'

function App() {
  const [apiStatus, setApiStatus] = useState({ message: '', loading: true, error: false });

  useEffect(() => {
    // Ping backend in background just to monitor status
    axios.get('http://localhost:5000/api/test')
      .then(response => {
        setApiStatus({ message: response.data.message, loading: false, error: false });
      })
      .catch(error => {
        setApiStatus({ message: 'Backend disconnected', loading: false, error: true });
      });
  }, []);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navbar />
        
        {/* Main Content Area */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/services" element={<Services />} />
            <Route path="/health-tips" element={<HealthTips />} />
            <Route path="/health-tips/:id" element={<HealthTipDetail />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/book" element={<BookAppointment />} />
            <Route path="/dashboard/patient" element={<PatientDashboard />} />
            <Route path="/dashboard/doctor" element={<DoctorDashboard />} />
            <Route path="/doctor/add-prescription" element={<AddPrescription />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<ManageDoctors />} />
            <Route path="/admin/patients" element={<ViewPatients />} />
            <Route path="/admin/appointments" element={<ViewAppointments />} />
            <Route path="/admin/messages" element={<ViewMessages />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
            <Route path="/admin/staff" element={<ManageStaff />} />
            <Route path="/admin/invoices" element={<ManageInvoices />} />
            <Route path="/admin/health-tips" element={<ManageHealthTips />} />
          </Routes>
        </main>

        <Footer />
        
        {/* Global Floating AI Assistant Widget */}
        <SymptomChecker />

        {/* Floating API Status Indicator (Optional, subtle UI element) */}
        {!apiStatus.loading && apiStatus.error && (
            <div style={{
              position: 'fixed',
              bottom: '20px',
              right: '20px',
              backgroundColor: 'rgba(239, 68, 68, 0.9)',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.8rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              zIndex: 9999
            }}>
              ⚠️ API Disconnected
            </div>
        )}
      </div>
    </Router>
  )
}

export default App
