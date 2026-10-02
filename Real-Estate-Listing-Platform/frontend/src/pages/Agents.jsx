import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, Building, ShieldCheck, ArrowRight, UserCheck } from 'lucide-react';
import { INDIAN_AGENTS } from '../data/indiaProperties';
import api from '../api/axios';

export default function Agents() {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/agents')
      .then((res) => {
        const fetched = res.data?.data || res.data?.agents || [];
        if (Array.isArray(fetched) && fetched.length > 0) {
          setAgents(fetched);
        } else {
          setAgents(INDIAN_AGENTS);
        }
      })
      .catch(() => {
        setAgents(INDIAN_AGENTS);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ backgroundColor: 'var(--bg-light, #f8fafc)', minHeight: '100vh', padding: '60px 0 100px' }}>
      <div className="container">

        {/* Page Header */}
        <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 60px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.05)',
              color: 'var(--primary, #0f172a)',
              padding: '6px 16px',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            <UserCheck size={14} />
            <span>Trusted Property Advisors</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 'clamp(32px, 5vw, 46px)',
              fontWeight: 800,
              color: 'var(--text-dark, #0f172a)',
              letterSpacing: '-1px',
              lineHeight: '1.15',
              marginBottom: '16px'
            }}
          >
            Meet Our Local Real Estate Agents
          </h1>

          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '18px', lineHeight: '1.6' }}>
            Direct connections to certified real estate advisors across India. Work with dedicated professionals who know your target neighbourhood inside out.
          </p>
        </div>

        {/* Agents Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
            Loading trusted agents...
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: '30px',
              marginBottom: '80px'
            }}
          >
            {agents.map((agent) => (
              <div
                key={agent._id || agent.id || agent.email}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                  border: '1px solid var(--border, #e2e8f0)',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 18px 36px rgba(0, 0, 0, 0.08)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.04)';
                }}
              >
                {/* Agent Header / Avatar */}
                <div style={{ position: 'relative', height: '220px', backgroundColor: '#0f172a', overflow: 'hidden' }}>
                  <img
                    src={agent.photo || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=85'}
                    alt={agent.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, rgba(15,23,42,0.85) 0%, transparent 60%)'
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: '16px', left: '20px', right: '20px', color: '#ffffff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      <ShieldCheck size={14} style={{ color: '#38bdf8' }} />
                      <span>Verified Advisor</span>
                    </div>
                    <h3 style={{ fontSize: '22px', fontWeight: 700, margin: '2px 0 0', color: '#ffffff' }}>
                      {agent.name}
                    </h3>
                  </div>
                </div>

                {/* Agent Card Body */}
                <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
                  {/* Agency badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--primary, #0f172a)', fontWeight: 600 }}>
                    <Building size={16} />
                    <span>{agent.agency || 'GharFind Luxury Group'}</span>
                  </div>

                  {/* Bio */}
                  <p style={{ fontSize: '14px', color: 'var(--text-muted, #64748b)', lineHeight: '1.6', margin: 0 }}>
                    {agent.bio || 'Specialising in prime residential properties, waterfront homes, and personalized buyer guidance.'}
                  </p>

                  <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9', margin: '4px 0' }} />

                  {/* Contact Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {agent.phone && (
                      <a
                        href={`tel:${agent.phone}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '14px',
                          color: 'var(--text-dark, #0f172a)',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                      >
                        <Phone size={15} style={{ color: 'var(--primary)' }} />
                        <span>{agent.phone}</span>
                      </a>
                    )}

                    {agent.email && (
                      <a
                        href={`mailto:${agent.email}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '14px',
                          color: 'var(--text-dark, #0f172a)',
                          textDecoration: 'none',
                          fontWeight: 500
                        }}
                      >
                        <Mail size={15} style={{ color: 'var(--primary)' }} />
                        <span>{agent.email}</span>
                      </a>
                    )}
                  </div>

                  {/* Action Button */}
                  <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                    <Link
                      to="/contact"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        backgroundColor: 'var(--primary, #0f172a)',
                        color: '#ffffff',
                        padding: '12px 20px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover, #1e293b)')}
                      onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary, #0f172a)')}
                    >
                      <span>Connect with Advisor</span>
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
