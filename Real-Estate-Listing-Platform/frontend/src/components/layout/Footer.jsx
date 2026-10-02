import React from 'react';
import { Link } from 'react-router-dom';
import { Home, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer id="contact" style={{
      backgroundColor: 'var(--dark)',
      color: '#ffffff',
      padding: '80px 0 30px',
      fontSize: '14px',
      lineHeight: '1.6',
      borderTop: '1px solid var(--border-dark)'
    }}>
      <div className="container">
        {/* Top footer grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '40px',
          marginBottom: '60px'
        }}>
          {/* Column 1: Brand Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <Link to="/" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 700,
              fontSize: '24px',
              color: '#ffffff',
              letterSpacing: '-0.5px'
            }}>
              <Home size={24} style={{ color: 'var(--primary)', strokeWidth: 2.5 }} />
              <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 800 }}>GharFind</span>
            </Link>
            <p style={{ color: 'var(--text-muted)', maxWidth: '280px' }}>
              Discover distinctive homes across India and meet the local advisors who know them best.
            </p>
            {/* Social Icons */}
            <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Twitter">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
              </a>
              <a href="#" className="social-icon" aria-label="Instagram">
                <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              </a>
            </div>
          </div>

          {/* Column 2: Buy Properties */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              marginBottom: '24px',
              fontWeight: 600,
              color: '#ffffff'
            }}>Buy Properties</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/listings?type=sale" className="footer-link">New Listings</Link></li>
              <li><Link to="/listings" className="footer-link">Virtual Tours</Link></li>
              <li><Link to="/listings" className="footer-link">Client Portals</Link></li>
            </ul>
          </div>

          {/* Column 3: Agent Portal */}
          <div>
            <h4 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              marginBottom: '24px',
              fontWeight: 600,
              color: '#ffffff'
            }}>Agent Portal</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li><Link to="/dashboard" className="footer-link">Marketing Tools</Link></li>
              <li><Link to="/dashboard" className="footer-link">CRM Support</Link></li>
              <li><Link to="/dashboard" className="footer-link">Lead Analytics</Link></li>
            </ul>
          </div>

          {/* Column 4: Contact info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h4 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '18px',
              marginBottom: '4px',
              fontWeight: 600,
              color: '#ffffff'
            }}>Contact Us</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <MapPin size={16} style={{ color: 'var(--primary)', marginTop: '4px', flexShrink: 0 }} />
                <span>Banjara Hills,<br />Hyderabad, Telangana 500034</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Phone size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>+91 40 4567 8900</span>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Mail size={16} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>hello@gharfind.in</span>
              </div>
            </div>
            <Link to="/contact" style={{
              color: 'var(--gold)',
              fontWeight: 600,
              textDecoration: 'underline',
              marginTop: '4px',
              display: 'inline-block'
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ffffff'}
            onMouseOut={(e) => e.currentTarget.style.color = 'var(--gold)'}
            >
              Send us a message
            </Link>
          </div>
        </div>

        <hr style={{ border: 'none', borderTop: '1px solid var(--border-dark)', marginBottom: '30px' }} />

        {/* Bottom footer bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          color: 'var(--text-muted)',
          fontSize: '13px'
        }}>
          <div>
            &copy; {new Date().getFullYear()} GharFind Properties. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '24px' }}>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-link {
          color: var(--text-muted) !important;
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: #ffffff !important;
        }
        .social-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: var(--border-dark);
          color: var(--text-muted);
          transition: all 0.2s ease;
        }
        .social-icon:hover {
          background-color: var(--primary);
          color: #ffffff;
          transform: translateY(-2px);
        }
      `}</style>
    </footer>
  );
}
