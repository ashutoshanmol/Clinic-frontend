import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../assets/logo_full.png';

const Navbar = () => {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'doctor') return '/dashboard/doctor';
    return '/dashboard/patient';
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'About Us', path: '/#about' },
    { label: 'Doctors', path: '/doctors' },
    { label: 'Services', path: '/services' },
    { label: 'Health Tips', path: '/health-tips' },
    { label: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="sticky top-6 z-[1000] mx-auto mb-10 w-[95%] max-w-7xl bg-white/85 backdrop-blur-xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] border border-white/60 rounded-full transition-all duration-500">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link 
          to="/" 
          className="flex items-center" 
          onClick={() => setIsMenuOpen(false)}
        >
          <img 
            src={logo} 
            alt="MedicareClinic Logo" 
            style={{ height: '80px', width: 'auto', objectFit: 'contain', mixBlendMode: 'multiply' }}
            className="hover:scale-105 active:scale-95 transition-all duration-300"
          />
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-10">
          <ul className="flex items-center gap-8 m-0 p-0 list-none">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              if (link.label === 'About Us' && location.pathname === '/') {
                return (
                  <li key={link.label}>
                    <button 
                      onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
                      className="relative text-[15px] font-semibold text-slate-500 hover:text-primary transition-colors duration-300 bg-none border-none p-2 cursor-pointer group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-full rounded-full"></span>
                    </button>
                  </li>
                );
              }
              return (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className={`relative text-[15px] font-semibold transition-colors duration-300 p-2 group flex items-center ${
                      isActive ? 'text-primary' : 'text-slate-500 hover:text-primary'
                    }`}
                  >
                    {link.label}
                    <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-primary transition-all duration-300 rounded-full ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-4 border-l border-slate-200 pl-8">
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="text-[15px] font-bold text-slate-700 hover:text-primary transition-colors pr-2"
                >
                  Sign In
                </Link>
                <Link to="/book">
                  <button className="px-8 py-3 text-[15px] font-bold bg-primary text-white rounded-full hover:bg-[#0f766e] transition-all transform hover:-translate-y-[2px] hover:shadow-[0_10px_25px_-5px_var(--primary)] active:scale-95 duration-300 flex items-center gap-2">
                    Book Appointment <span className="text-lg leading-none">›</span>
                  </button>
                </Link>
              </>
            ) : (
              <Link to={getDashboardPath()}>
                <button className="px-8 py-3 text-[15px] font-bold bg-slate-50 text-primary border border-slate-200 shadow-sm rounded-full hover:bg-slate-100 hover:shadow-md transition-all active:scale-95 duration-300 flex items-center gap-2">
                  <span className="text-lg leading-none">⚙️</span> Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile menu button */}
        <button 
          className="lg:hidden text-slate-800 p-2 hover:bg-slate-100 rounded-lg transition-colors" 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-[500px] border-t border-slate-100' : 'max-h-0'}`}>
        <div className="px-6 py-10 flex flex-col gap-6 bg-white rounded-b-2xl shadow-xl">
          <ul className="flex flex-col gap-5 p-0 list-none font-semibold">
            {navLinks.map((link) => (
              <li key={link.path}>
                <Link 
                  to={link.path} 
                  className={`text-lg ${location.pathname === link.path ? 'text-primary' : 'text-slate-600'}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          
          <div className="flex flex-col gap-4 mt-4 pt-6 border-t border-slate-100">
            {!user ? (
              <>
                <Link 
                  to="/login" 
                  className="text-lg font-bold text-slate-800 text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign In
                </Link>
                <Link to="/book" className="w-full" onClick={() => setIsMenuOpen(false)}>
                  <button className="w-full py-4 text-lg font-bold bg-primary text-white rounded-xl shadow-lg shadow-primary/20">
                    Book Appointment
                  </button>
                </Link>
              </>
            ) : (
              <Link to={getDashboardPath()} className="w-full" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full py-4 text-lg font-bold bg-sky-50 text-primary border-2 border-primary rounded-xl">
                  Go to Dashboard
                </button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
