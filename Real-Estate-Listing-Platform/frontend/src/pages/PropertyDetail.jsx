import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Bed, Bath, Square, Maximize, Calendar, MapPin, Heart, Share2,
  ArrowLeft, ChevronLeft, ChevronRight, X, CheckCircle2, User,
  Mail, Phone, Building, Sparkles, Shield, Waves, Car, Flame,
  Wind, Trees, Dumbbell, Compass, Check, AlertCircle, Grid, Send,
  ArrowRight, Star, FileText
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import PropertyCard from '../components/property/PropertyCard';
import { INDIA_PROPERTIES } from '../data/indiaProperties';
import { isPropertyFavorited, toggleFavorite } from '../utils/favorites';
import { getProperty } from '../api/properties.api';

// Helper to format currency
function formatCurrency(amount) {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
}

// Helper to format compact price for map marker badge
function formatPriceCompact(price) {
  if (!price && price !== 0) return '₹0';
  if (price >= 10000000) {
    const crore = price / 10000000;
    return `₹${Number(crore.toFixed(1))} Cr`;
  }
  if (price >= 100000) {
    const lakh = price / 100000;
    return `₹${Number(lakh.toFixed(0))} L`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
}

// Safe extraction of [lat, lng]
function getCoords(property) {
  if (property?.lat !== undefined && property?.lng !== undefined) {
    return [Number(property.lat), Number(property.lng)];
  }
  if (property?.location && Array.isArray(property.location.coordinates)) {
    return [Number(property.location.coordinates[1]), Number(property.location.coordinates[0])];
  }
  return [19.076, 72.8777];
}

// Custom Leaflet marker for single property map
function createSingleMapMarkerIcon(price) {
  return L.divIcon({
    className: 'custom-single-marker-wrapper',
    html: `
      <div class="single-property-marker">
        <span class="marker-dot"></span>
        <span class="marker-text">${formatPriceCompact(price)}</span>
      </div>
    `,
    iconSize: [84, 38],
    iconAnchor: [42, 19],
    popupAnchor: [0, -22]
  });
}

// Amenity Metadata Mapping
const AMENITY_MAP = {
  pool: { label: 'Swimming Pool', icon: Waves },
  gym: { label: 'Fitness Center / Gym', icon: Dumbbell },
  parking: { label: 'Covered Parking', icon: Car },
  garage: { label: 'Private Garage', icon: Car },
  balcony: { label: 'Private Balcony', icon: Compass },
  fireplace: { label: 'Fireplace', icon: Flame },
  airConditioning: { label: 'Air Conditioning', icon: Wind },
  smartHome: { label: 'Smart Home Automation', icon: Sparkles },
  security: { label: '24/7 Security System', icon: Shield },
  waterfront: { label: 'Ocean/Waterfront View', icon: Waves },
  garden: { label: 'Private Landscaped Garden', icon: Trees },
  dock: { label: 'Private Boat Dock', icon: Compass },
  tennisCourt: { label: 'Tennis Court', icon: Star },
  petFriendly: { label: 'Pet Friendly', icon: Heart }
};

// Default Agent fallback
const DEFAULT_AGENT = {
  _id: 'agent-1',
  name: 'Mira Shah',
  title: 'Senior Property Advisor',
  agency: 'GharFind Mumbai',
  phone: '+91 98200 44120',
  email: 'mira.shah@gharfind.in',
  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=85',
  rating: 4.9,
  reviewsCount: 42,
  propertiesSold: 156
};

// --- Full Page Skeleton Loader Component ---
function PropertyDetailSkeleton() {
  return (
    <div className="container" style={{ padding: '40px 24px 80px' }}>
      {/* Top Breadcrumb & Actions Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div className="skeleton" style={{ width: '120px', height: '24px', borderRadius: '6px' }} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
          <div className="skeleton" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        </div>
      </div>

      {/* Gallery Skeleton */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(12, 1fr)',
        gap: '16px',
        height: '460px',
        marginBottom: '40px',
        borderRadius: '20px',
        overflow: 'hidden'
      }}>
        <div className="skeleton" style={{ gridColumn: 'span 8', height: '100%' }} />
        <div style={{ gridColumn: 'span 4', display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
          <div className="skeleton" style={{ height: '50%', width: '100%' }} />
          <div className="skeleton" style={{ height: '50%', width: '100%' }} />
        </div>
      </div>

      {/* Two Column Layout Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '48px' }}>
        {/* Left Column Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          <div>
            <div className="skeleton" style={{ width: '70%', height: '36px', marginBottom: '12px', borderRadius: '6px' }} />
            <div className="skeleton" style={{ width: '40%', height: '20px', marginBottom: '20px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '30%', height: '32px', borderRadius: '6px' }} />
          </div>

          <div className="skeleton" style={{ width: '100%', height: '80px', borderRadius: '16px' }} />

          <div>
            <div className="skeleton" style={{ width: '180px', height: '24px', marginBottom: '16px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '100%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '90%', height: '16px', marginBottom: '8px', borderRadius: '4px' }} />
            <div className="skeleton" style={{ width: '75%', height: '16px', borderRadius: '4px' }} />
          </div>

          <div className="skeleton" style={{ width: '100%', height: '200px', borderRadius: '16px' }} />
          <div className="skeleton" style={{ width: '100%', height: '350px', borderRadius: '16px' }} />
        </div>

        {/* Right Column Sticky Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div className="skeleton" style={{ width: '100%', height: '180px', borderRadius: '20px' }} />
          <div className="skeleton" style={{ width: '100%', height: '360px', borderRadius: '20px' }} />
        </div>
      </div>
    </div>
  );
}

// --- Main PropertyDetail Component ---
export default function PropertyDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [agent, setAgent] = useState(DEFAULT_AGENT);
  const [similarProperties, setSimilarProperties] = useState([]);
  
  // Favorites State with initial value from localStorage
  const [isFavorited, setIsFavorited] = useState(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('user_favorites') || '[]');
      return Array.isArray(favs) && favs.includes(id);
    } catch {
      return false;
    }
  });
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

  // Lightbox State
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Inquiry Form State
  const [inquiryForm, setInquiryForm] = useState({
    name: '',
    email: '',
    phone: '',
    requestType: 'property-visit',
    preferredDate: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  // Pre-fill user details if logged in
  useEffect(() => {
    if (isLoggedIn) {
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        if (storedUser.name || storedUser.email) {
          setInquiryForm((prev) => ({
            ...prev,
            name: storedUser.name || '',
            email: storedUser.email || ''
          }));
        }
      } catch {
        // Ignore JSON error
      }
    }
  }, [isLoggedIn]);

  // Sync favorited state when id changes
  useEffect(() => {
    if (id) {
      setIsFavorited(isPropertyFavorited(id));
    }
  }, [id]);

  // Helper to fetch agent & similar items
  const fetchAgentAndSimilar = useCallback((currentProperty) => {
    // 1. Agent
    if (currentProperty.agent && typeof currentProperty.agent === 'object') {
      setAgent({ ...DEFAULT_AGENT, ...currentProperty.agent });
    } else if (currentProperty.agent) {
      fetch(`/api/agents/${currentProperty.agent}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && (data.data || data.agent)) {
            setAgent({ ...DEFAULT_AGENT, ...(data.data || data.agent) });
          }
        })
        .catch(() => setAgent(DEFAULT_AGENT));
    } else {
      setAgent(DEFAULT_AGENT);
    }

    // 2. Similar properties matching same city or propertyType
    const currentId = currentProperty._id || currentProperty.id;
    const city = currentProperty.address?.city?.toLowerCase();
    const type = currentProperty.propertyType?.toLowerCase();

    fetch(`/api/properties?city=${city || ''}&type=${type || ''}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = data?.data || data?.properties || [];
        const filtered = list.filter((p) => (p._id || p.id) !== currentId);
        if (filtered.length >= 2) {
          setSimilarProperties(filtered);
        } else {
          throw new Error('Not enough API similar items');
        }
      })
      .catch(() => {
        // Fallback to filtering MOCK_PROPERTIES
        const mockSimilar = INDIA_PROPERTIES.filter((p) => {
          const pId = p._id || p.id;
          if (pId === currentId) return false;
          const sameCity = city && p.address?.city?.toLowerCase() === city;
          const sameType = type && p.propertyType?.toLowerCase() === type;
          return sameCity || sameType;
        });

        if (mockSimilar.length > 0) {
          setSimilarProperties(mockSimilar);
        } else {
          setSimilarProperties(INDIA_PROPERTIES.filter((p) => (p._id || p.id) !== currentId).slice(0, 4));
        }
      });
  }, []);

  // Fetch Property Data & Agent & Similar
  useEffect(() => {
    let isSubscribed = true;

    // Fetch using getProperty API module
    getProperty(id)
      .then((resData) => {
        if (!isSubscribed) return;
        const prop = resData.data || resData.property || resData;
        if (!prop || (!prop._id && !prop.id)) {
          setNotFound(true);
        } else {
          setProperty(prop);
          setNotFound(false);
          fetchAgentAndSimilar(prop);
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!isSubscribed) return;
        console.warn('API detail fetch failed, falling back to mock properties:', err);
        // Fallback to custom properties and MOCK_PROPERTIES lookup
        const customPropsStr = localStorage.getItem('custom_properties');
        const customProps = customPropsStr ? JSON.parse(customPropsStr) : [];
        const allLocal = [...customProps, ...INDIA_PROPERTIES];
        const foundMock = allLocal.find(
          (p) => p._id === id || p.id === id || String(p.id) === String(id)
        );

        if (foundMock) {
          setProperty(foundMock);
          setNotFound(false);
          fetchAgentAndSimilar(foundMock);
        } else {
          setNotFound(true);
        }
        setLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [id, fetchAgentAndSimilar]);

  // Lightbox Navigation Controls
  const openLightbox = (index = 0) => {
    setActiveImageIdx(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const handlePrevImage = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!property?.images || property.images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveImageIdx((prev) => (prev === 0 ? property.images.length - 1 : prev - 1));
      setIsTransitioning(false);
    }, 150);
  }, [property]);

  const handleNextImage = useCallback((e) => {
    if (e) e.stopPropagation();
    if (!property?.images || property.images.length <= 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveImageIdx((prev) => (prev === property.images.length - 1 ? 0 : prev + 1));
      setIsTransitioning(false);
    }, 150);
  }, [property]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') handlePrevImage();
      if (e.key === 'ArrowRight') handleNextImage();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, handlePrevImage, handleNextImage]);

  // Favorite Toggle Handler
  const handleToggleFavorite = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (property) {
      const nextState = toggleFavorite(property);
      setIsFavorited(nextState);
    }
  };

  // Inquiry Form Handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setInquiryForm((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!inquiryForm.name.trim()) errors.name = 'Full name is required';
    if (!inquiryForm.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiryForm.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }
    if (!inquiryForm.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (inquiryForm.phone.trim().length < 7) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (inquiryForm.requestType !== 'call' && !inquiryForm.preferredDate) {
      errors.preferredDate = 'Choose a preferred date so the agent can plan ahead';
    }
    if (!inquiryForm.message.trim()) {
      errors.message = 'Please provide a brief message';
    } else if (inquiryForm.message.trim().length < 5) {
      errors.message = 'Message must be at least 5 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInquirySubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    const payload = {
      propertyId: id,
      propertyTitle: property?.title,
      ...inquiryForm
    };

    fetch('/api/inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then((res) => (res.ok ? res.json() : Promise.reject('Failed')))
      .then(() => {
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setInquiryForm((prev) => ({ ...prev, message: '' }));
      })
      .catch(() => {
        // Simulated success when offline/mock API
        setTimeout(() => {
          setIsSubmitting(false);
          setSubmitSuccess(true);
          setInquiryForm((prev) => ({ ...prev, message: '' }));
        }, 600);
      });
  };

  // Share link handler
  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 3000);
    }
  };

  // Render Skeleton while loading
  if (loading) {
    return <PropertyDetailSkeleton />;
  }

  // Render 404 Empty State
  if (notFound || !property) {
    return (
      <div className="container" style={{ padding: '100px 24px', textAlign: 'center' }}>
        <div style={{
          maxWidth: '560px',
          margin: '0 auto',
          backgroundColor: '#ffffff',
          border: '1px solid var(--border)',
          borderRadius: '24px',
          padding: '48px 32px',
          boxShadow: 'var(--shadow)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--primary-light)',
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px'
          }}>
            <Building size={38} />
          </div>

          <h1 className="font-serif" style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px' }}>
            Property Not Found
          </h1>

          <p style={{ color: 'var(--text-muted)', fontSize: '15px', lineHeight: '1.6', marginBottom: '32px' }}>
            The property listing you are looking for doesn't exist, has been sold, or has been removed.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/listings" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              padding: '12px 24px',
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '14px'
            }}>
              Browse All Listings <ArrowRight size={16} />
            </Link>

            <Link to="/" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--bg-offset)',
              color: 'var(--text-dark)',
              border: '1px solid var(--border)',
              padding: '12px 24px',
              borderRadius: '50px',
              fontWeight: 600,
              fontSize: '14px'
            }}>
              <ArrowLeft size={16} /> Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Destructure property details with safe defaults
  const {
    title = 'Luxury Real Estate Property',
    price = 0,
    type = 'sale',
    propertyType = 'house',
    bedrooms = 0,
    bathrooms = 0,
    areaSqft = 0,
    lotSize = '0.35 Acres',
    yearBuilt = '2022',
    address = { street: '123 Prime Way', city: 'City', state: 'State', zip: '00000' },
    description = 'Stunning estate offering luxury finishes and modern architectural elegance.',
    images = [],
    amenities = [],
    featured = false
  } = property;

  const propertyImages = images.length > 0
    ? images
    : ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80'];

  const heroImage = propertyImages[0];
  const gridThumbnails = propertyImages.slice(1, 5);
  const totalPhotosCount = propertyImages.length;
  const coords = getCoords(property);

  return (
    <div style={{ backgroundColor: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* Top Header & Breadcrumb Bar */}
      <div style={{ borderBottom: '1px solid var(--border)', backgroundColor: '#ffffff' }}>
        <div className="container" style={{
          padding: '16px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Link to="/listings" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--text)',
            fontSize: '14px',
            fontWeight: 600
          }}>
            <ArrowLeft size={18} /> Back to Listings
          </Link>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={handleShare}
              title="Share property"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '50px',
                backgroundColor: 'var(--bg-offset)',
                border: '1px solid var(--border)',
                color: 'var(--text-dark)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {copiedShare ? <Check size={16} style={{ color: 'green' }} /> : <Share2 size={16} />}
              <span>{copiedShare ? 'Copied Link!' : 'Share'}</span>
            </button>

            <button
              onClick={handleToggleFavorite}
              title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '50px',
                backgroundColor: isFavorited ? '#ffe4e6' : 'var(--bg-offset)',
                border: isFavorited ? '1px solid #fecdd3' : '1px solid var(--border)',
                color: isFavorited ? '#e11d48' : 'var(--text-dark)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              <Heart
                size={16}
                style={{
                  fill: isFavorited ? '#e11d48' : 'none',
                  color: isFavorited ? '#e11d48' : 'currentColor'
                }}
              />
              <span>{isFavorited ? 'Saved' : 'Save'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="container" style={{ paddingTop: '28px' }}>
        
        {/* --- Image Gallery Grid --- */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: gridThumbnails.length > 0 ? 'repeat(12, 1fr)' : '1fr',
          gap: '16px',
          height: '460px',
          marginBottom: '36px',
          borderRadius: '24px',
          overflow: 'hidden',
          position: 'relative'
        }} className="gallery-container">
          
          {/* Main Hero Photo */}
          <div
            onClick={() => openLightbox(0)}
            style={{
              gridColumn: gridThumbnails.length > 0 ? 'span 8' : 'span 12',
              height: '100%',
              position: 'relative',
              cursor: 'pointer',
              overflow: 'hidden',
              backgroundColor: '#f1f5f9'
            }}
            className="gallery-hero"
          >
            <img
              src={heroImage}
              alt={title}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.4s ease'
              }}
              className="gallery-img"
            />
            {featured && (
              <span style={{
                position: 'absolute',
                top: '20px',
                left: '20px',
                backgroundColor: 'var(--gold)',
                color: '#ffffff',
                fontSize: '11px',
                fontWeight: 700,
                letterSpacing: '1px',
                padding: '6px 14px',
                borderRadius: '4px',
                textTransform: 'uppercase',
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
              }}>
                Featured
              </span>
            )}
          </div>

          {/* Thumbnail Grid (Up to 4) */}
          {gridThumbnails.length > 0 && (
            <div style={{
              gridColumn: 'span 4',
              display: 'grid',
              gridTemplateRows: gridThumbnails.length >= 3 ? 'repeat(2, 1fr)' : '1fr',
              gridTemplateColumns: gridThumbnails.length >= 2 ? 'repeat(2, 1fr)' : '1fr',
              gap: '16px',
              height: '100%'
            }}>
              {gridThumbnails.map((thumb, idx) => {
                const imgIndex = idx + 1;
                const isLast = idx === gridThumbnails.length - 1;
                const remainingCount = totalPhotosCount - 5;

                return (
                  <div
                    key={idx}
                    onClick={() => openLightbox(imgIndex)}
                    style={{
                      position: 'relative',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      borderRadius: '12px',
                      height: '100%',
                      backgroundColor: '#f1f5f9'
                    }}
                    className="gallery-thumb"
                  >
                    <img
                      src={thumb}
                      alt={`${title} view ${imgIndex + 1}`}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.4s ease'
                      }}
                      className="gallery-img"
                    />

                    {/* View All Photos Overlay on Last Thumbnail */}
                    {isLast && remainingCount > 0 && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(18, 24, 36, 0.65)',
                        backdropFilter: 'blur(3px)',
                        color: '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px',
                        fontWeight: 700,
                        fontSize: '16px'
                      }}>
                        <Grid size={22} />
                        <span>+{remainingCount} Photos</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Floating "View All Photos" Button */}
          <button
            onClick={() => openLightbox(0)}
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '20px',
              backgroundColor: '#ffffff',
              color: 'var(--text-dark)',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              zIndex: 10,
              transition: 'transform 0.2s ease, background-color 0.2s ease'
            }}
            className="view-all-btn"
          >
            <Grid size={16} />
            <span>View all photos ({totalPhotosCount})</span>
          </button>
        </div>

        {/* --- Two-Column Section Below Gallery --- */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 380px',
          gap: '48px',
          alignItems: 'start'
        }} className="two-column-layout">
          
          {/* LEFT COLUMN */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            
            {/* Header / Title / Address / Price */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                <span style={{
                  backgroundColor: 'var(--dark)',
                  color: '#ffffff',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  For {type === 'sale' ? 'Sale' : 'Rent'}
                </span>
                
                <span style={{
                  backgroundColor: 'var(--primary-light)',
                  color: 'var(--primary)',
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}>
                  {propertyType}
                </span>
              </div>

              <h1 className="font-serif" style={{
                fontSize: '38px',
                fontWeight: 700,
                lineHeight: '1.25',
                color: 'var(--text-dark)',
                marginBottom: '8px'
              }}>
                {title}
              </h1>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--text-muted)',
                fontSize: '15px',
                marginBottom: '20px'
              }}>
                <MapPin size={18} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                <span>{address.street}, {address.city}, {address.state} {address.zip || ''}</span>
              </div>

              <div style={{
                fontSize: '36px',
                fontWeight: 800,
                color: 'var(--primary)',
                letterSpacing: '-0.5px'
              }}>
                {formatCurrency(price)}
                {type === 'rent' && <span style={{ fontSize: '18px', fontWeight: 500, color: 'var(--text-muted)' }}>/mo</span>}
              </div>
            </div>

            {/* Property Brochure View */}
            {property.brochureUrl && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                backgroundColor: 'rgba(197, 160, 89, 0.08)',
                border: '1px solid rgba(197, 160, 89, 0.25)',
                borderRadius: '16px',
                marginBottom: '4px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FileText size={20} style={{ color: 'var(--primary)' }} />
                  <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>Property Brochure (PDF)</span>
                </div>
                <a 
                  href={property.brochureUrl.startsWith('http') ? property.brochureUrl : `http://localhost:5001${property.brochureUrl}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    padding: '8px 18px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'background-color 0.2s'
                  }}
                  className="brochure-btn"
                >
                  View Brochure
                </a>
              </div>
            )}

            {/* Specs Icon Row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
              gap: '16px',
              backgroundColor: 'var(--bg-offset)',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '20px 24px'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Bed size={18} style={{ color: 'var(--primary)' }} />
                  <span>Bedrooms</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>{bedrooms} Beds</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Bath size={18} style={{ color: 'var(--primary)' }} />
                  <span>Bathrooms</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>{bathrooms} Baths</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Square size={16} style={{ color: 'var(--primary)' }} />
                  <span>Living Area</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>
                  {areaSqft ? areaSqft.toLocaleString() : 'N/A'} sqft
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Maximize size={16} style={{ color: 'var(--primary)' }} />
                  <span>Lot Size</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>{lotSize || '0.25 Acres'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '13px' }}>
                  <Calendar size={16} style={{ color: 'var(--primary)' }} />
                  <span>Year Built</span>
                </div>
                <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)' }}>{yearBuilt || '2023'}</span>
              </div>
            </div>

            {/* Description Section */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
              <h2 className="font-serif" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px' }}>
                About This Property
              </h2>
              <p style={{
                color: 'var(--text)',
                fontSize: '16px',
                lineHeight: '1.8',
                whiteSpace: 'pre-line'
              }}>
                {description}
              </p>
            </div>

            {/* Amenities Grid */}
            {amenities && amenities.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
                <h2 className="font-serif" style={{ fontSize: '24px', fontWeight: 700, marginBottom: '20px' }}>
                  Property Features & Amenities
                </h2>
                
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
                  gap: '16px'
                }}>
                  {amenities.map((amenityKey, idx) => {
                    const meta = AMENITY_MAP[amenityKey] || {
                      label: amenityKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                      icon: Check
                    };
                    const IconComponent = meta.icon;

                    return (
                      <div
                        key={idx}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '14px 18px',
                          backgroundColor: 'var(--bg-offset)',
                          borderRadius: '12px',
                          border: '1px solid var(--border)'
                        }}
                      >
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary-light)',
                          color: 'var(--primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}>
                          <IconComponent size={18} />
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                          {meta.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Embedded Mini Leaflet Map */}
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
                <h2 className="font-serif" style={{ fontSize: '24px', fontWeight: 700 }}>
                  Location & Neighborhood
                </h2>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                  {address.street}, {address.city}
                </span>
              </div>

              <div style={{
                height: '350px',
                width: '100%',
                borderRadius: '20px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                position: 'relative'
              }}>
                <MapContainer
                  center={coords}
                  zoom={14}
                  scrollWheelZoom={false}
                  style={{ width: '100%', height: '100%', zIndex: 1 }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  <Marker position={coords} icon={createSingleMapMarkerIcon(price)}>
                    <Popup closeButton={true}>
                      <div style={{ padding: '6px' }}>
                        <strong style={{ fontSize: '13px' }}>{title}</strong>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>{address.street}</div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN (Sticky Sidebar) */}
          <div style={{
            position: 'sticky',
            top: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }} className="sticky-sidebar">
            
            {/* Agent Card */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '24px',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <img
                  src={agent.avatar}
                  alt={agent.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid var(--primary-light)'
                  }}
                />
                <div>
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '2px' }}>
                    {agent.name}
                  </h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    {agent.title}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--gold)', fontWeight: 600 }}>
                    <Star size={14} style={{ fill: 'var(--gold)' }} />
                    <span>{agent.rating || 4.9}</span>
                    <span style={{ color: 'var(--text-muted)' }}>({agent.reviewsCount || 40} reviews)</span>
                  </div>
                </div>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                paddingTop: '12px',
                borderTop: '1px solid var(--border)'
              }}>
                <a
                  href={`tel:${agent.phone}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-offset)',
                    color: 'var(--text-dark)',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid var(--border)'
                  }}
                >
                  <Phone size={14} style={{ color: 'var(--primary)' }} />
                  <span>Call Agent</span>
                </a>

                <a
                  href={`mailto:${agent.email}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    padding: '10px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--bg-offset)',
                    color: 'var(--text-dark)',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: '1px solid var(--border)'
                  }}
                >
                  <Mail size={14} style={{ color: 'var(--primary)' }} />
                  <span>Email</span>
                </a>
              </div>
            </div>

            {/* Inquiry Form */}
            <div style={{
              backgroundColor: '#ffffff',
              border: '1px solid var(--border)',
              borderRadius: '20px',
              padding: '28px',
              boxShadow: 'var(--shadow)'
            }}>
              <h3 className="font-serif" style={{ fontSize: '20px', fontWeight: 700, marginBottom: '6px' }}>
                Speak with the property advisor
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
                Choose a call, in-person visit or video meeting. The local advisor will confirm the details with you.
              </p>

              {submitSuccess ? (
                <div style={{
                  padding: '32px 16px',
                  textAlign: 'center',
                  backgroundColor: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '16px',
                  animation: 'fadeIn 0.4s ease'
                }}>
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 6px 16px rgba(34, 197, 94, 0.3)'
                  }}>
                    <CheckCircle2 size={32} />
                  </div>
                  <h4 style={{ fontSize: '18px', fontWeight: 700, color: '#14532d', marginBottom: '6px' }}>
                    Inquiry Received!
                  </h4>
                  <p style={{ fontSize: '13px', color: '#166534', marginBottom: '20px', lineHeight: '1.5' }}>
                    Thank you! {agent.name} will reach out to you shortly to schedule a viewing.
                  </p>
                  <button
                    onClick={() => setSubmitSuccess(false)}
                    style={{
                      backgroundColor: '#166534',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 20px',
                      borderRadius: '50px',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Send another inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleInquirySubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', color: 'var(--text-dark)', fontSize: '12px', fontWeight: 600 }}>
                    How would you like to connect?
                    <select name="requestType" value={inquiryForm.requestType} onChange={handleInputChange} style={{ padding: '10px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: '#fff', fontSize: '14px' }}>
                      <option value="property-visit">Visit the property</option>
                      <option value="video-meeting">Schedule a video meeting</option>
                      <option value="call">Request a phone call</option>
                    </select>
                  </label>
                  {inquiryForm.requestType !== 'call' && (
                    <label style={{ display: 'flex', flexDirection: 'column', gap: '5px', color: 'var(--text-dark)', fontSize: '12px', fontWeight: 600 }}>
                      Preferred date
                      <input type="date" name="preferredDate" value={inquiryForm.preferredDate} min={new Date().toISOString().slice(0, 10)} onChange={handleInputChange} style={{ padding: '10px 12px', border: formErrors.preferredDate ? '1px solid #ef4444' : '1px solid var(--border)', borderRadius: '8px', fontSize: '14px' }} />
                      {formErrors.preferredDate && <span style={{ color: '#ef4444', fontSize: '11px' }}>{formErrors.preferredDate}</span>}
                    </label>
                  )}
                  {/* Name Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      Full Name *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <User size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                      <input
                        type="text"
                        name="name"
                        value={inquiryForm.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 36px',
                          borderRadius: '8px',
                          border: formErrors.name ? '1px solid #ef4444' : '1px solid var(--border)',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    {formErrors.name && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} /> {formErrors.name}
                      </span>
                    )}
                  </div>

                  {/* Email Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      Email Address *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                      <input
                        type="email"
                        name="email"
                        value={inquiryForm.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 36px',
                          borderRadius: '8px',
                          border: formErrors.email ? '1px solid #ef4444' : '1px solid var(--border)',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    {formErrors.email && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} /> {formErrors.email}
                      </span>
                    )}
                  </div>

                  {/* Phone Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      Phone Number *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <Phone size={16} style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-muted)' }} />
                      <input
                        type="tel"
                        name="phone"
                        value={inquiryForm.phone}
                        onChange={handleInputChange}
                        placeholder="+91 98765 43210"
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 36px',
                          borderRadius: '8px',
                          border: formErrors.phone ? '1px solid #ef4444' : '1px solid var(--border)',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                    {formErrors.phone && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} /> {formErrors.phone}
                      </span>
                    )}
                  </div>

                  {/* Message Input */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-dark)' }}>
                      Message *
                    </label>
                    <textarea
                      name="message"
                      rows={3}
                      value={inquiryForm.message}
                      onChange={handleInputChange}
                      placeholder={`I would like to schedule a private showing for ${title}...`}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        border: formErrors.message ? '1px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        outline: 'none',
                        resize: 'none'
                      }}
                    />
                    {formErrors.message && (
                      <span style={{ fontSize: '11px', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <AlertCircle size={12} /> {formErrors.message}
                      </span>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '14px',
                      borderRadius: '50px',
                      fontWeight: 700,
                      fontSize: '14px',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      marginTop: '6px',
                      transition: 'background-color 0.2s ease',
                      opacity: isSubmitting ? 0.7 : 1
                    }}
                  >
                    {isSubmitting ? (
                      <span>Sending Inquiry...</span>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Send Message to Agent</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Bottom Sticky Favorite Button */}
              <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <button
                  onClick={handleToggleFavorite}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    padding: '12px',
                    borderRadius: '50px',
                    border: isFavorited ? '1px solid #fecdd3' : '1px solid var(--border)',
                    backgroundColor: isFavorited ? '#fff1f2' : 'var(--bg-offset)',
                    color: isFavorited ? '#e11d48' : 'var(--text-dark)',
                    fontWeight: 700,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Heart
                    size={18}
                    style={{
                      fill: isFavorited ? '#e11d48' : 'none',
                      color: isFavorited ? '#e11d48' : 'currentColor'
                    }}
                  />
                  <span>{isFavorited ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </button>
              </div>

            </div>

          </div>

        </div>

        {/* --- Similar Properties Section at Bottom --- */}
        {similarProperties.length > 0 && (
          <div style={{ marginTop: '72px', borderTop: '1px solid var(--border)', paddingTop: '48px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '28px' }}>
              <div>
                <span style={{ color: 'var(--gold)', fontWeight: 700, fontSize: '12px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Recommended
                </span>
                <h2 className="font-serif" style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-dark)' }}>
                  Similar Properties
                </h2>
              </div>

              <Link to="/listings" style={{
                color: 'var(--primary)',
                fontWeight: 600,
                fontSize: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                View All Listings <ArrowRight size={16} />
              </Link>
            </div>

            {/* Horizontally Scrollable Row */}
            <div className="scroll-container hide-scrollbar" style={{
              display: 'flex',
              gap: '24px',
              overflowX: 'auto',
              paddingBottom: '20px',
              scrollSnapType: 'x mandatory'
            }}>
              {similarProperties.map((simProp) => (
                <div
                  key={simProp._id || simProp.id}
                  style={{
                    width: '340px',
                    flex: '0 0 auto',
                    scrollSnapAlign: 'start'
                  }}
                >
                  <PropertyCard property={simProp} />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* --- Fullscreen Lightbox Modal --- */}
      {lightboxOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            backgroundColor: 'rgba(10, 14, 22, 0.95)',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            animation: 'fadeIn 0.25s ease'
          }}
        >
          {/* Lightbox Header Bar */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '20px 32px',
            color: '#ffffff',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: '#ffffff' }}>
                {title}
              </h4>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>
                Photo {activeImageIdx + 1} of {totalPhotosCount}
              </span>
            </div>

            <button
              onClick={closeLightbox}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: '#ffffff',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease'
              }}
              className="lightbox-close-btn"
            >
              <X size={22} />
            </button>
          </div>

          {/* Lightbox Main Image Display */}
          <div style={{
            flexGrow: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 80px',
            overflow: 'hidden'
          }}>
            {/* Left Nav Arrow */}
            {totalPhotosCount > 1 && (
              <button
                onClick={handlePrevImage}
                style={{
                  position: 'absolute',
                  left: '24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  border: 'none',
                  color: '#ffffff',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all 0.2s ease'
                }}
                className="lightbox-nav-btn"
              >
                <ChevronLeft size={28} />
              </button>
            )}

            {/* Active Image with Crossfade Transition */}
            <img
              src={propertyImages[activeImageIdx]}
              alt={`Photo ${activeImageIdx + 1}`}
              style={{
                maxHeight: '72vh',
                maxWidth: '90vw',
                objectFit: 'contain',
                borderRadius: '12px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
                opacity: isTransitioning ? 0.3 : 1,
                transform: isTransitioning ? 'scale(0.98)' : 'scale(1)',
                transition: 'opacity 0.2s ease, transform 0.2s ease'
              }}
            />

            {/* Right Nav Arrow */}
            {totalPhotosCount > 1 && (
              <button
                onClick={handleNextImage}
                style={{
                  position: 'absolute',
                  right: '24px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(4px)',
                  border: 'none',
                  color: '#ffffff',
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 10,
                  transition: 'all 0.2s ease'
                }}
                className="lightbox-nav-btn"
              >
                <ChevronRight size={28} />
              </button>
            )}
          </div>

          {/* Lightbox Bottom Thumbnails Strip */}
          {totalPhotosCount > 1 && (
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              gap: '12px',
              justifyContent: 'center',
              overflowX: 'auto'
            }} className="hide-scrollbar">
              {propertyImages.map((img, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setIsTransitioning(true);
                    setTimeout(() => {
                      setActiveImageIdx(index);
                      setIsTransitioning(false);
                    }, 150);
                  }}
                  style={{
                    width: '64px',
                    height: '48px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    opacity: activeImageIdx === index ? 1 : 0.4,
                    border: activeImageIdx === index ? '2px solid var(--primary)' : '2px solid transparent',
                    transition: 'all 0.2s ease',
                    flexShrink: 0
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Embedded Dynamic CSS for Hover Effects & Responsive Layout */}
      <style>{`
        .gallery-hero:hover .gallery-img,
        .gallery-thumb:hover .gallery-img {
          transform: scale(1.04);
        }
        .view-all-btn:hover {
          transform: translateY(-2px);
          background-color: var(--primary-light) !important;
          color: var(--primary) !important;
        }
        .lightbox-close-btn:hover,
        .lightbox-nav-btn:hover {
          background-color: rgba(255, 255, 255, 0.3) !important;
          transform: translateY(-50%) scale(1.08) !important;
        }
        .lightbox-close-btn:hover {
          transform: scale(1.08) !important;
        }
        
        /* Single Leaflet Map Marker Styling */
        .custom-single-marker-wrapper {
          background: transparent !important;
          border: none !important;
        }
        .single-property-marker {
          background-color: var(--dark, #121824);
          color: #ffffff;
          padding: 8px 14px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
          border: 2px solid #ffffff;
          white-space: nowrap;
        }
        .marker-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background-color: #22c55e;
          display: inline-block;
        }

        @media (max-width: 992px) {
          .two-column-layout {
            grid-template-columns: 1fr !important;
          }
          .sticky-sidebar {
            position: static !important;
          }
          .gallery-container {
            height: 340px !important;
          }
        }

        @media (max-width: 640px) {
          .gallery-container {
            grid-template-columns: 1fr !important;
            height: 260px !important;
          }
          .gallery-hero {
            grid-column: span 12 !important;
          }
          .gallery-thumb {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
