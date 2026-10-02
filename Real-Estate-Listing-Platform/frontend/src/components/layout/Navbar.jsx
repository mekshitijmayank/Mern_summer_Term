import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Home, Heart, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  // Handle sticky background blur on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : '#ffffff',
      backdropFilter: isScrolled ? 'blur(8px)' : 'none',
      borderBottom: '1px solid var(--border)',
      transition: 'all 0.3s ease',
      height: '80px',
      display: 'flex',
      alignItems: 'center'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%'
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontWeight: 700,
          fontSize: '24px',
          color: 'var(--text-dark)',
          letterSpacing: '-0.5px'
        }}>
          <Home size={24} style={{ color: 'var(--primary)', strokeWidth: 2.5 }} />
          <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800 }}>GharFind</span>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{
          display: 'none',
          gap: '32px',
          alignItems: 'center'
        }} className="desktop-nav">
          <Link to="/listings?type=sale" className="nav-link">BUY</Link>
          <Link to="/listings?type=rent" className="nav-link">RENT</Link>
          <Link to="/agents" className="nav-link">AGENTS</Link>
          <Link to="/favorites" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Heart size={14} style={{ fill: 'var(--primary)', color: 'var(--primary)' }} />
            SAVED
          </Link>
          {isAuthenticated && currentUser && (
            <Link to="/dashboard" className="nav-link">MY SPACE</Link>
          )}
          <Link to="/contact" className="nav-link">CONTACT US</Link>
        </nav>

        {/* Auth CTA or User Profile */}
        <div style={{ display: 'none', alignItems: 'center' }} className="desktop-nav">
          {isAuthenticated && currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <Link to="/profile" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '50px',
                backgroundColor: 'var(--bg-offset, #f8fafc)',
                border: '1px solid var(--border, #e2e8f0)',
                textDecoration: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              className="navbar-profile-card"
              >
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary, #c9a063)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '13px',
                  fontWeight: 700,
                  overflow: 'hidden'
                }}>
                  {currentUser.photo ? (
                    <img 
                      src={currentUser.photo} 
                      alt={currentUser.name} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.2, color: 'var(--text-dark)' }}>
                    {currentUser.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                    {currentUser.role || 'Member'}
                  </span>
                </div>
              </Link>
            </div>
          ) : (
            <Link to="/login" style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '14px',
              letterSpacing: '0.5px',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease, transform 0.1s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'var(--primary-hover)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'var(--primary)'}
            >
              JOIN / REGISTER
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'block',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-dark)',
            padding: '4px'
          }}
          className="mobile-toggle"
          aria-label="Toggle menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '80px',
          left: 0,
          right: 0,
          backgroundColor: '#ffffff',
          borderBottom: '1px solid var(--border)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: 'var(--shadow)',
          zIndex: 999
        }}>
          <Link to="/listings?type=sale" onClick={() => setIsOpen(false)} style={{ fontWeight: 600 }}>BUY</Link>
          <Link to="/listings?type=rent" onClick={() => setIsOpen(false)} style={{ fontWeight: 600 }}>RENT</Link>
          <Link to="/agents" onClick={() => setIsOpen(false)} style={{ fontWeight: 600 }}>AGENTS</Link>
          <Link to="/favorites" onClick={() => setIsOpen(false)} style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Heart size={16} style={{ fill: 'var(--primary)', color: 'var(--primary)' }} />
            SAVED HOMES
          </Link>
          {isAuthenticated && currentUser && (
            <Link to="/dashboard" onClick={() => setIsOpen(false)} style={{ fontWeight: 600 }}>MY SPACE</Link>
          )}
          <Link to="/contact" onClick={() => setIsOpen(false)} style={{ fontWeight: 600 }}>CONTACT US</Link>
          <hr style={{ border: 'none', borderTop: '1px solid var(--border)' }} />
          
          {isAuthenticated && currentUser ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link to="/profile" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none', color: 'inherit' }}>
                <User size={18} style={{ color: 'var(--primary)' }} />
                <span style={{ fontWeight: 600 }}>{currentUser.name} ({currentUser.role})</span>
              </Link>
            </div>
          ) : (
            <Link to="/login" onClick={() => setIsOpen(false)} style={{
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '12px',
              borderRadius: '50px',
              fontWeight: 600,
              textAlign: 'center'
            }}>
              JOIN / REGISTER
            </Link>
          )}
        </div>
      )}

      {/* Inline styles for hover effects and media queries */}
      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle {
            display: none !important;
          }
        }
        .nav-link {
          font-weight: 600;
          font-size: 13px;
          letter-spacing: 1px;
          color: var(--text-dark);
          position: relative;
          padding: 8px 0;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: 0;
          left: 0;
          background-color: var(--primary);
          transition: width 0.2s ease;
        }
        .nav-link:hover {
          color: var(--primary);
        }
        .nav-link:hover::after {
          width: 100%;
        }
      `}</style>
    </header>
  );
}
