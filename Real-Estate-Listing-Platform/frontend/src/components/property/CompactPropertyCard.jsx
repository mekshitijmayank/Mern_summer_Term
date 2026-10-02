import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
import formatPrice from '../../utils/formatPrice';

export default function CompactPropertyCard({
  property,
  isHovered,
  isSelected,
  onMouseEnter,
  onMouseLeave,
  onClick
}) {
  const propId = property._id || property.id;
  const mainImage =
    (property.images && property.images[0]) ||
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80';

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      style={{
        display: 'flex',
        gap: '14px',
        backgroundColor: isSelected ? 'var(--primary-light)' : '#ffffff',
        border: isSelected
          ? '2px solid var(--primary)'
          : isHovered
          ? '1px solid var(--primary)'
          : '1px solid var(--border)',
        borderRadius: '14px',
        padding: '12px',
        transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        boxShadow: isHovered || isSelected ? 'var(--shadow)' : 'var(--shadow-sm)',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'none'
      }}
    >
      {/* Thumbnail */}
      <div
        style={{
          width: '120px',
          height: '100px',
          borderRadius: '10px',
          overflow: 'hidden',
          flexShrink: 0,
          position: 'relative',
          backgroundColor: '#f1f5f9'
        }}
      >
        <img
          src={mainImage}
          alt={property.title}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s ease'
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '6px',
            left: '6px',
            backgroundColor: 'rgba(18, 24, 36, 0.75)',
            backdropFilter: 'blur(4px)',
            color: '#ffffff',
            fontSize: '9px',
            fontWeight: 700,
            padding: '2px 6px',
            borderRadius: '4px',
            textTransform: 'uppercase'
          }}
        >
          {property.type === 'sale' ? 'Sale' : 'Rent'}
        </div>
      </div>

      {/* Property Information */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flexGrow: 1, minWidth: 0 }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
            <h4
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: 'var(--text-dark)',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                lineHeight: '1.3'
              }}
            >
              {property.title}
            </h4>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--text-muted)',
              fontSize: '12px',
              marginTop: '4px'
            }}
          >
            <MapPin size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {property.address?.street}, {property.address?.city}
            </span>
          </div>
        </div>

        {/* Specs Row */}
        <div style={{ display: 'flex', gap: '12px', fontSize: '11px', color: 'var(--text)', marginTop: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bed size={12} style={{ color: 'var(--text-muted)' }} />
            <span>{property.bedrooms || 0}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Bath size={12} style={{ color: 'var(--text-muted)' }} />
            <span>{property.bathrooms || 0}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Square size={11} style={{ color: 'var(--text-muted)' }} />
            <span>{property.areaSqft ? property.areaSqft.toLocaleString() : 0} sqft</span>
          </div>
        </div>

        {/* Price & Link */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
            {formatPrice(property.price, property.type)}
          </span>
          <Link
            to={`/properties/${propId}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              fontSize: '12px',
              fontWeight: 600,
              color: 'var(--primary)',
              textDecoration: 'none'
            }}
          >
            View Details &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
