import React from 'react';
import PropertyCard from './PropertyCard';
import { PropertyGridSkeleton } from './PropertySkeleton';

export default function PropertyGrid({ properties, loading, emptyMessage }) {
  if (loading) {
    return <PropertyGridSkeleton count={6} />;
  }

  if (!properties || properties.length === 0) {
    return (
      <div style={{
        padding: '60px 20px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        color: 'var(--text-muted)'
      }}>
        <p style={{ fontSize: '16px', fontWeight: 500 }}>
          {emptyMessage || 'No properties matched your criteria. Try adjusting your filters.'}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '28px',
      width: '100%'
    }}>
      {properties.map((property) => (
        <PropertyCard 
          key={property._id || property.id} 
          property={property} 
        />
      ))}
    </div>
  );
}
