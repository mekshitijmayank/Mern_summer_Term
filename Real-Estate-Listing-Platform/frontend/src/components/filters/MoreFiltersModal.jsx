import React from 'react';
import { X, Check, RotateCcw } from 'lucide-react';

const ALL_AMENITIES = [
  { id: 'pool', label: 'Swimming Pool' },
  { id: 'gym', label: 'Fitness Center / Gym' },
  { id: 'parking', label: 'Parking Space' },
  { id: 'garage', label: 'Private Garage' },
  { id: 'balcony', label: 'Balcony / Terrace' },
  { id: 'petFriendly', label: 'Pet Friendly' },
  { id: 'fireplace', label: 'Fireplace' },
  { id: 'airConditioning', label: 'Air Conditioning' },
  { id: 'garden', label: 'Private Garden' },
  { id: 'waterfront', label: 'Waterfront / Ocean View' },
  { id: 'smartHome', label: 'Smart Home System' },
  { id: 'security', label: '24/7 Security System' }
];

export default function MoreFiltersModal({
  isOpen,
  onClose,
  filters,
  onChangeFilter,
  onResetFilters,
  onApply
}) {
  if (!isOpen) return null;

  const selectedAmenities = filters.amenities || [];

  const toggleAmenity = (id) => {
    let updated;
    if (selectedAmenities.includes(id)) {
      updated = selectedAmenities.filter((item) => item !== id);
    } else {
      updated = [...selectedAmenities, id];
    }
    onChangeFilter('amenities', updated);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(18, 24, 36, 0.5)',
          backdropFilter: 'blur(4px)',
          zIndex: 1100,
          animation: 'fadeIn 0.25s ease'
        }}
      />

      {/* Slide-in Panel from Right */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '460px',
          backgroundColor: '#ffffff',
          zIndex: 1200,
          boxShadow: '-10px 0 30px rgba(0,0,0,0.15)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--bg-offset)'
          }}
        >
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-dark)' }}>
              More Filters
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Refine your property search specifications
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters panel"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--border)';
              e.currentTarget.style.color = 'var(--text-dark)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div
          style={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '28px'
          }}
        >
          {/* Listing Purpose (For Sale / For Rent) */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '12px' }}>
              Listing Status
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {[
                { value: 'all', label: 'All Listings' },
                { value: 'sale', label: 'For Sale' },
                { value: 'rent', label: 'For Rent' }
              ].map((item) => {
                const isActive = (filters.type || 'all') === item.value;
                return (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => onChangeFilter('type', item.value)}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isActive ? 'var(--primary-light)' : '#ffffff',
                      color: isActive ? 'var(--primary)' : 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px', border: '1px solid var(--border)', borderRadius: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(filters.luxury)}
              onChange={(event) => onChangeFilter('luxury', event.target.checked)}
              style={{ width: '17px', height: '17px', accentColor: 'var(--primary)' }}
            />
            <span>
              <strong style={{ display: 'block', color: 'var(--text-dark)', fontSize: '14px' }}>Luxury collection</strong>
              <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>Homes priced at ₹2 Cr and above</span>
            </span>
          </label>

          {/* Bathrooms filter */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '12px' }}>
              Bathrooms
            </h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['any', '1', '2', '3', '4+'].map((b) => {
                const isActive = String(filters.bathrooms || 'any') === b;
                return (
                  <button
                    key={b}
                    type="button"
                    onClick={() => onChangeFilter('bathrooms', b === 'any' ? '' : b)}
                    style={{
                      flex: 1,
                      padding: '8px 0',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isActive ? 'var(--primary)' : '#ffffff',
                      color: isActive ? '#ffffff' : 'var(--text)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center'
                    }}
                  >
                    {b === 'any' ? 'Any' : `${b} Bath`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Country filter */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '12px' }}>
              Country
            </h3>
            <input
              type="text"
              placeholder="e.g. United States, France"
              value={filters.country || ''}
              onChange={(e) => onChangeFilter('country', e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                fontSize: '14px',
                outline: 'none',
                color: 'var(--text-dark)'
              }}
            />
          </div>

          {/* Amenities Checkboxes */}
          <div>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '14px' }}>
              Amenities & Features
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
              {ALL_AMENITIES.map((amenity) => {
                const isChecked = selectedAmenities.includes(amenity.id);
                return (
                  <label
                    key={amenity.id}
                    onClick={() => toggleAmenity(amenity.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: isChecked ? '1px solid var(--primary)' : '1px solid var(--border)',
                      backgroundColor: isChecked ? 'var(--primary-light)' : '#ffffff',
                      cursor: 'pointer',
                      userSelect: 'none',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '4px',
                        border: isChecked ? 'none' : '2px solid var(--text-muted)',
                        backgroundColor: isChecked ? 'var(--primary)' : 'transparent',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {isChecked && <Check size={14} style={{ color: '#ffffff', strokeWidth: 3 }} />}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: isChecked ? 600 : 400, color: 'var(--text-dark)' }}>
                      {amenity.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            backgroundColor: '#ffffff'
          }}
        >
          <button
            type="button"
            onClick={onResetFilters}
            style={{
              padding: '12px 16px',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              backgroundColor: '#ffffff',
              color: 'var(--text)',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease'
            }}
          >
            <RotateCcw size={16} /> Reset
          </button>
          <button
            type="button"
            onClick={() => {
              if (onApply) onApply();
              onClose();
            }}
            style={{
              flex: 1,
              padding: '12px 20px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: 'var(--primary)',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary-hover)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--primary)';
            }}
          >
            Show Results
          </button>
        </div>
      </div>
    </>
  );
}
