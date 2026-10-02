import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import { isPropertyFavorited, toggleFavorite } from '../../utils/favorites';
import formatPrice from '../../utils/formatPrice';

export default function PropertyCard({ property, isFavorited: propIsFavorited, onFavoriteToggle }) {
  const navigate = useNavigate();
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || Boolean(localStorage.getItem('token'));
  
  const propertyId = property?._id || property?.id;
  const [isFavorited, setIsFavorited] = useState(() => {
    if (propIsFavorited !== undefined) return propIsFavorited;
    return isPropertyFavorited(propertyId);
  });

  useEffect(() => {
    if (propIsFavorited !== undefined) {
      setIsFavorited(propIsFavorited);
    } else {
      setIsFavorited(isPropertyFavorited(propertyId));
    }

    const handleSync = () => {
      if (propIsFavorited === undefined) {
        setIsFavorited(isPropertyFavorited(propertyId));
      }
    };

    window.addEventListener('favorites-updated', handleSync);
    return () => window.removeEventListener('favorites-updated', handleSync);
  }, [propertyId, propIsFavorited]);

  const handleFavoriteClick = (e) => {
    e.preventDefault(); // Stop click from bubbling to the parent Link
    e.stopPropagation();

    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    const nextState = toggleFavorite(property);
    setIsFavorited(nextState);

    if (onFavoriteToggle) {
      onFavoriteToggle(property, nextState);
    }
  };

  // Safe destructuring with fallback mock data
  const {
    id = 'mock-1',
    _id,
    title = 'Luxury Modern Villa',
    price = 1250000,
    type = 'sale',
    propertyType = 'villa',
    bedrooms = 4,
    bathrooms = 4.5,
    areaSqft = 4200,
    address = { street: 'Bandra West', city: 'Mumbai', state: 'Maharashtra' },
    images = ['https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80'],
    featured = true
  } = property;

  const mainImage = images[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80';

  return (
    <Link to={`/properties/${propertyId}`} className="property-card" style={{
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: '#ffffff',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease',
      boxShadow: 'var(--shadow-sm)',
      position: 'relative'
    }}>
      {/* Property Image Frame */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '66.67%', /* 3:2 Aspect Ratio */
        overflow: 'hidden',
        backgroundColor: '#f1f5f9'
      }}>
        <img 
          src={mainImage} 
          alt={title} 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.5s ease'
          }}
          className="card-image"
        />

        {/* Dark overlay for top section gradient */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '60px',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Featured Badge */}
        {featured && (
          <div style={{
            position: 'absolute',
            top: '16px',
            left: '16px',
            backgroundColor: 'var(--gold)',
            color: '#ffffff',
            padding: '6px 12px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase',
            zIndex: 10
          }}>
            Featured
          </div>
        )}

        {/* Type Badge (Sale / Rent) */}
        <div style={{
          position: 'absolute',
          bottom: '16px',
          left: '16px',
          backgroundColor: 'rgba(18, 24, 36, 0.75)',
          backdropFilter: 'blur(4px)',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          zIndex: 10
        }}>
          For {type === 'sale' ? 'Sale' : 'Rent'}
        </div>

        {/* Favorite Heart Button */}
        <button 
          onClick={handleFavoriteClick}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'transform 0.2s ease, background-color 0.2s ease',
            boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
            zIndex: 10
          }}
          className="favorite-btn"
        >
          <Heart 
            size={18} 
            style={{
              color: isFavorited ? '#e11d48' : '#121824',
              fill: isFavorited ? '#e11d48' : 'none',
              transition: 'fill 0.2s ease, color 0.2s ease'
            }} 
          />
        </button>
      </div>

      {/* Property Details */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <h3 className="font-serif" style={{
            fontSize: '20px',
            fontWeight: 700,
            lineHeight: '1.3',
            color: 'var(--text-dark)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {title}
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '13px' }}>
            <MapPin size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span>{address.street}, {address.city}</span>
          </div>
        </div>

        {/* Specs Row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          padding: '10px 0',
          fontSize: '13px',
          color: 'var(--text)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bed size={16} style={{ color: 'var(--text-muted)' }} />
            <span>{bedrooms} Beds</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Bath size={16} style={{ color: 'var(--text-muted)' }} />
            <span>{bathrooms} Baths</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Square size={14} style={{ color: 'var(--text-muted)' }} />
            <span>{areaSqft.toLocaleString()} sqft</span>
          </div>
        </div>

        {/* Price Tag */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginTop: 'auto'
        }}>
          <span style={{
            fontSize: '22px',
            fontWeight: 800,
            color: 'var(--primary)'
          }}>
            {formatPrice(price, type)}
          </span>
        </div>
      </div>

      <style>{`
        .property-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg) !important;
        }
        .property-card:hover .card-image {
          transform: scale(1.05);
        }
        .favorite-btn:hover {
          transform: scale(1.1);
          background-color: #ffffff !important;
        }
      `}</style>
    </Link>
  );
}
