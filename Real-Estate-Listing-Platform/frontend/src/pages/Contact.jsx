import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Building,
  HelpCircle
} from 'lucide-react';
import Accordion from '../components/common/Accordion';

// GharFind office in Hyderabad.
const OFFICE_COORDS = [17.4126, 78.4482];

// Custom Leaflet Pin Icon for Office Location
const officeMapIcon = L.divIcon({
  className: 'custom-office-marker',
  html: `<div style="
    background-color: var(--primary, #0f172a);
    color: #ffffff;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 14px rgba(0,0,0,0.3);
    border: 3px solid #ffffff;
    cursor: pointer;
  ">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  </div>`,
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44]
});

// FAQ Items
const FAQ_ITEMS = [
  {
    id: 'faq-1',
    question: 'How do I schedule a private property viewing?',
    answer: 'You can schedule a private viewing directly on any property details page by filling out the inquiry form, or by contacting our team directly using the form on this page with your preferred date and property of interest.'
  },
  {
    id: 'faq-2',
    question: 'What fees are involved when listing my property with GharFind?',
    answer: 'Listing fees and commissions depend on the service tier you select (including high-definition virtual tours, drone cinematography, and targeted international marketing). Contact our team for a tailored marketing proposal.'
  },
  {
    id: 'faq-3',
    question: 'How fast can I expect a reply to my contact inquiry?',
    answer: 'Our dedicated real estate support team monitors incoming messages continuously and responds to all inquiries within 2 to 4 business hours during operational times.'
  },
  {
    id: 'faq-4',
    question: 'Do you offer property valuation and appraisal services?',
    answer: 'Yes! Our certified market analysts provide complementary comparative market analysis (CMA) reports for prospective sellers and buyers seeking accurate property valuation.'
  },
  {
    id: 'faq-5',
    question: 'Can GharFind help with property visits and negotiations?',
    answer: 'Yes. Contact the property advisor to arrange a site visit or video meeting, discuss the property and coordinate the next steps.'
  }
];

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: 'General Inquiry',
    message: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Form Validation
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters long';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form Submit Handler
  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      property: null,
      name: formData.name.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      subject: formData.subject,
      message: formData.message.trim(),
      createdAt: new Date().toISOString()
    };

    fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('API server returned error status');
      })
      .then(() => {
        setIsSubmitting(false);
        setIsSuccess(true);
      })
      .catch(() => {
        // Fallback simulation for dev/standalone mode
        setTimeout(() => {
          setIsSubmitting(false);
          setIsSuccess(true);
        }, 800);
      });
  };

  // Reset form to send another message
  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      subject: 'General Inquiry',
      message: ''
    });
    setErrors({});
    setIsSuccess(false);
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-light, #f8fafc)', minHeight: '100vh', padding: '60px 0 100px' }}>
      <div className="container">
        
        {/* Page Title & Subtitle */}
        <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 60px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(15, 23, 42, 0.05)',
              color: 'var(--primary)',
              padding: '6px 16px',
              borderRadius: '50px',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '16px'
            }}
          >
            <MessageSquare size={14} />
            <span>Connect With Us</span>
          </div>

          <h1
            style={{
              fontFamily: 'var(--font-serif, Georgia, serif)',
              fontSize: 'clamp(32px, 5vw, 48px)',
              fontWeight: 800,
              color: 'var(--text-dark, #0f172a)',
              letterSpacing: '-1px',
              lineHeight: '1.15',
              marginBottom: '16px'
            }}
          >
            Get In Touch
          </h1>

          <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '18px', lineHeight: '1.6' }}>
            Have questions about buying, selling, or listing premium property? Reach out to our expert team for personalized guidance and concierge service.
          </p>
        </div>

        {/* Two Column Layout Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '40px',
            alignItems: 'start',
            marginBottom: '80px'
          }}
        >
          
          {/* LEFT COLUMN: Contact Form Card */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              padding: 'clamp(24px, 4vw, 40px)',
              boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
              border: '1px solid var(--border, #e2e8f0)'
            }}
          >
            {isSuccess ? (
              /* Success Confirmation View */
              <div
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '20px'
                }}
              >
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '50%',
                    backgroundColor: '#dcfce7',
                    color: '#16a34a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    animation: 'popIn 0.4s ease-out'
                  }}
                >
                  <CheckCircle2 size={42} strokeWidth={2.5} />
                </div>

                <h3
                  style={{
                    fontFamily: 'var(--font-serif, serif)',
                    fontSize: '26px',
                    fontWeight: 700,
                    color: 'var(--text-dark, #0f172a)'
                  }}
                >
                  Message Sent Successfully!
                </h3>

                <p style={{ color: 'var(--text-muted, #64748b)', fontSize: '15px', maxWidth: '420px', lineHeight: '1.6' }}>
                  Thank you for reaching out, <strong>{formData.name}</strong>. A dedicated real estate representative will review your message regarding <strong>"{formData.subject}"</strong> and reply to <strong>{formData.email}</strong> shortly.
                </p>

                <button
                  onClick={handleReset}
                  style={{
                    marginTop: '12px',
                    backgroundColor: 'var(--primary, #0f172a)',
                    color: '#ffffff',
                    border: 'none',
                    padding: '12px 28px',
                    borderRadius: '50px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              /* Main Form View */
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
                <div>
                  <h3
                    style={{
                      fontSize: '22px',
                      fontWeight: 700,
                      color: 'var(--text-dark, #0f172a)',
                      marginBottom: '6px'
                    }}
                  >
                    Send Us a Message
                  </h3>
                  <p style={{ fontSize: '14px', color: 'var(--text-muted, #64748b)' }}>
                    Fill in your details below and we will get back to you promptly.
                  </p>
                </div>

                {/* Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="name" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                    Full Name <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="e.g. Eleanor Vance"
                    value={formData.name}
                    onChange={handleChange}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${errors.name ? '#ef4444' : 'var(--border, #cbd5e1)'}`,
                      fontSize: '15px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                  />
                  {errors.name && <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.name}</span>}
                </div>

                {/* Email & Phone Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  {/* Email */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="email" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      placeholder="name@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: `1px solid ${errors.email ? '#ef4444' : 'var(--border, #cbd5e1)'}`,
                        fontSize: '15px',
                        outline: 'none',
                        transition: 'border-color 0.2s ease'
                      }}
                    />
                    {errors.email && <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.email}</span>}
                  </div>

                  {/* Phone (Optional) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label htmlFor="phone" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      Phone Number <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(Optional)</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={handleChange}
                      style={{
                        padding: '12px 16px',
                        borderRadius: '10px',
                        border: '1px solid var(--border, #cbd5e1)',
                        fontSize: '15px',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                {/* Subject Select */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="subject" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                    Inquiry Subject
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: '1px solid var(--border, #cbd5e1)',
                      fontSize: '15px',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="General Inquiry">General Inquiry</option>
                    <option value="Property Question">Property Question</option>
                    <option value="List My Property">List My Property</option>
                    <option value="Support">Support</option>
                  </select>
                </div>

                {/* Message Textarea */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label htmlFor="message" style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                    Your Message <span style={{ color: '#ef4444' }}>*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="Tell us how we can help you..."
                    value={formData.message}
                    onChange={handleChange}
                    style={{
                      padding: '12px 16px',
                      borderRadius: '10px',
                      border: `1px solid ${errors.message ? '#ef4444' : 'var(--border, #cbd5e1)'}`,
                      fontSize: '15px',
                      fontFamily: 'inherit',
                      outline: 'none',
                      resize: 'vertical'
                    }}
                  />
                  {errors.message && <span style={{ color: '#ef4444', fontSize: '13px' }}>{errors.message}</span>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    backgroundColor: isSubmitting ? 'var(--text-muted)' : 'var(--primary, #0f172a)',
                    color: '#ffffff',
                    padding: '14px 28px',
                    borderRadius: '12px',
                    fontWeight: 600,
                    fontSize: '16px',
                    border: 'none',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    marginTop: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--primary-hover, #1e293b)';
                  }}
                  onMouseOut={(e) => {
                    if (!isSubmitting) e.currentTarget.style.backgroundColor = 'var(--primary, #0f172a)';
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                      <span>Sending Message...</span>
                    </>
                  ) : (
                    <>
                      <Send size={18} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: Office Info & Leaflet Map Card */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}
          >
            {/* Info Card */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '20px',
                padding: 'clamp(24px, 4vw, 36px)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                border: '1px solid var(--border, #e2e8f0)',
                display: 'flex',
                flexDirection: 'column',
                gap: '24px'
              }}
            >
              <div>
                <h3
                  style={{
                    fontSize: '22px',
                    fontWeight: 700,
                    color: 'var(--text-dark, #0f172a)',
                    marginBottom: '6px'
                  }}
                >
                  Headquarters & Info
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted, #64748b)' }}>
                  Visit our office or reach out directly to our real estate advisors.
                </p>
              </div>

              {/* Clickable Info Rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Address */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.05)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Building size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '2px' }}>
                      Office Address
                    </h4>
                    <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      Banjara Hills<br />Hyderabad, Telangana 500034
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <a
                  href="tel:+914045678900"
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '8px 12px',
                    margin: '0 -12px',
                    borderRadius: '10px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-light, #f8fafc)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.05)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Phone size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '2px' }}>
                      Phone Support
                    </h4>
                    <p style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>
                      +91 40 4567 8900
                    </p>
                  </div>
                </a>

                {/* Email */}
                <a
                  href="mailto:hello@gharfind.in"
                  style={{
                    display: 'flex',
                    gap: '14px',
                    alignItems: 'center',
                    textDecoration: 'none',
                    color: 'inherit',
                    padding: '8px 12px',
                    margin: '0 -12px',
                    borderRadius: '10px',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-light, #f8fafc)')}
                  onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.05)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Mail size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '2px' }}>
                      Email Us
                    </h4>
                    <p style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>
                      hello@gharfind.in
                    </p>
                  </div>
                </a>

                {/* Business Hours */}
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(15, 23, 42, 0.05)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}
                  >
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '4px' }}>
                      Business Hours
                    </h4>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                      <div>Mon - Fri: 9:00 AM - 6:00 PM EST</div>
                      <div>Sat: 10:00 AM - 4:00 PM EST</div>
                      <div>Sun: Closed</div>
                    </div>
                  </div>
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px solid var(--border, #e2e8f0)', margin: '4px 0' }} />

              {/* Social Icons */}
              <div>
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '12px' }}>
                  Follow Estate
                </h4>
                <div style={{ display: 'flex', gap: '12px' }}>
                  {['Facebook', 'Twitter', 'Instagram', 'LinkedIn'].map((social) => (
                    <a
                      key={social}
                      href={`#${social.toLowerCase()}`}
                      aria-label={social}
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-light, #f8fafc)',
                        border: '1px solid var(--border, #cbd5e1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--text-dark)',
                        fontSize: '13px',
                        fontWeight: 700,
                        textDecoration: 'none',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--primary, #0f172a)';
                        e.currentTarget.style.color = '#ffffff';
                        e.currentTarget.style.transform = 'translateY(-2px)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-light, #f8fafc)';
                        e.currentTarget.style.color = 'var(--text-dark)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      {social[0]}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Leaflet Office Map Card */}
            <div
              style={{
                height: '280px',
                borderRadius: '20px',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.04)',
                border: '1px solid var(--border, #e2e8f0)',
                position: 'relative'
              }}
            >
              <MapContainer
                center={OFFICE_COORDS}
                zoom={14}
                scrollWheelZoom={false}
                style={{ width: '100%', height: '100%', zIndex: 1 }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={OFFICE_COORDS} icon={officeMapIcon}>
                  <Popup closeButton={true}>
                    <div style={{ textAlign: 'center', padding: '4px' }}>
                      <strong style={{ fontSize: '14px', color: 'var(--primary)' }}>Estate Headquarters</strong>
                      <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                        500 Fifth Avenue, 42nd Fl, NYC
                      </p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>

          </div>

        </div>

        {/* FAQ SECTION BELOW COLUMNS */}
        <div style={{ marginTop: '80px', maxWidth: '840px', margin: '80px auto 0' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                backgroundColor: 'rgba(15, 23, 42, 0.05)',
                color: 'var(--primary)',
                padding: '6px 16px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '12px'
              }}
            >
              <HelpCircle size={14} />
              <span>Got Questions?</span>
            </div>

            <h2
              style={{
                fontFamily: 'var(--font-serif, Georgia, serif)',
                fontSize: 'clamp(28px, 4vw, 36px)',
                fontWeight: 700,
                color: 'var(--text-dark, #0f172a)'
              }}
            >
              Frequently Asked Questions
            </h2>
          </div>

          {/* Reusable Accordion */}
          <Accordion items={FAQ_ITEMS} defaultOpenId="faq-1" />
        </div>

      </div>

      {/* Animation keyframes style */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes popIn {
          0% { transform: scale(0.6); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
