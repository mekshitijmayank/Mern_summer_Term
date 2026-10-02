import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ShieldCheck, Star, Building2 } from 'lucide-react';

export default function AuthLayout({ children, tagline, title, subtitle }) {
  return (
    <div className="auth-container" style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      overflowX: 'hidden',
      backgroundColor: '#ffffff',
      fontFamily: 'var(--font-sans, system-ui, -apple-system, sans-serif)'
    }}>
      {/* Left half - Visual Property Showcase (Desktop / Laptop) */}
      <div className="auth-banner" style={{
        flex: '1.1',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px 56px',
        backgroundImage: 'linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(30, 41, 59, 0.65) 60%, rgba(15, 23, 42, 0.9) 100%), url("https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: '#ffffff',
      }}>
        {/* Brand Header */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <Link to="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: '#ffffff',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(12px)',
            padding: '10px 18px',
            borderRadius: '50px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            transition: 'all 0.2s ease'
          }}>
            <Home size={22} style={{ color: 'var(--primary, #c9a063)', strokeWidth: 2.5 }} />
            <span style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: '20px',
              fontWeight: 800,
              letterSpacing: '-0.3px'
            }}>
              GharFind
            </span>
          </Link>
        </div>

        {/* Hero Tagline & Features */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '520px', marginY: 'auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(201, 160, 99, 0.2)',
            color: '#f3e8d6',
            border: '1px solid rgba(201, 160, 99, 0.4)',
            padding: '6px 14px',
            borderRadius: '50px',
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '20px'
          }}>
            <ShieldCheck size={15} /> India’s premium home collection
          </div>

          <h2 style={{
            fontFamily: 'var(--font-serif, serif)',
            fontSize: '42px',
            lineHeight: 1.15,
            fontWeight: 700,
            color: '#ffffff',
            marginBottom: '16px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.4)'
          }}>
            {tagline || "Discover extraordinary homes across India."}
          </h2>

          <p style={{
            fontSize: '16px',
            lineHeight: '1.6',
            color: 'rgba(255, 255, 255, 0.85)',
            marginBottom: '32px'
          }}>
            Explore considered homes across India, connect with verified local advisors, and manage your property journey in one place.
          </p>

          {/* Social Proof / Stats Badges */}
          <div style={{
            display: 'flex',
            gap: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Building2 size={20} style={{ color: 'var(--primary, #c9a063)' }} />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>12,500+</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Luxury Listings</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Star size={20} style={{ color: 'var(--primary, #c9a063)' }} />
              </div>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 700, lineHeight: 1 }}>4.9 / 5</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>Client Rating</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info in left pane */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          fontSize: '13px',
          color: 'rgba(255, 255, 255, 0.6)'
        }}>
          © {new Date().getFullYear()} GharFind Properties. All rights reserved.
        </div>
      </div>

      {/* Right half - Centered Auth Form */}
      <div style={{
        flex: '1',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 24px',
        backgroundColor: '#ffffff',
        position: 'relative'
      }}>
        {/* Mobile Header Logo */}
        <div className="mobile-brand-header" style={{
          width: '100%',
          maxWidth: '440px',
          marginBottom: '24px',
          display: 'none',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            textDecoration: 'none',
            color: 'var(--text-dark, #0f172a)',
            fontWeight: 800,
            fontSize: '22px'
          }}>
            <Home size={22} style={{ color: 'var(--primary, #c9a063)' }} />
            <span style={{ fontFamily: 'var(--font-serif, serif)' }}>Estate</span>
          </Link>
          <Link to="/" style={{
            fontSize: '13px',
            color: 'var(--text-muted, #64748b)',
            textDecoration: 'none',
            fontWeight: 500
          }}>
            Back to Home
          </Link>
        </div>

        <div style={{
          width: '100%',
          maxWidth: '440px'
        }}>
          {title && (
            <h1 style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: '32px',
              fontWeight: 700,
              color: 'var(--text-dark, #0f172a)',
              marginBottom: '8px',
              letterSpacing: '-0.5px'
            }}>
              {title}
            </h1>
          )}
          {subtitle && (
            <p style={{
              color: 'var(--text-muted, #64748b)',
              fontSize: '15px',
              marginBottom: '32px',
              lineHeight: 1.5
            }}>
              {subtitle}
            </p>
          )}

          {children}
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .auth-banner {
            display: none !important;
          }
          .mobile-brand-header {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
