import React from 'react';

export function PropertyCardSkeleton() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#ffffff',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        height: '100%',
        position: 'relative'
      }}
    >
      {/* Image Skeleton */}
      <div
        className="skeleton"
        style={{
          width: '100%',
          paddingTop: '66.67%',
          position: 'relative'
        }}
      />

      {/* Content Skeleton */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div className="skeleton" style={{ height: '22px', width: '80%', borderRadius: '6px' }} />
          <div className="skeleton" style={{ height: '14px', width: '55%', borderRadius: '4px' }} />
        </div>

        {/* Specs Row Skeleton */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border)',
            borderBottom: '1px solid var(--border)',
            padding: '12px 0',
            marginTop: 'auto'
          }}
        >
          <div className="skeleton" style={{ height: '14px', width: '60px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '14px', width: '60px', borderRadius: '4px' }} />
          <div className="skeleton" style={{ height: '14px', width: '70px', borderRadius: '4px' }} />
        </div>

        {/* Price Tag Skeleton */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="skeleton" style={{ height: '24px', width: '120px', borderRadius: '6px' }} />
          <div className="skeleton" style={{ height: '18px', width: '70px', borderRadius: '4px' }} />
        </div>
      </div>
    </div>
  );
}

export function PropertyGridSkeleton({ count = 6 }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '28px',
        width: '100%'
      }}
    >
      {Array.from({ length: count }).map((_, idx) => (
        <PropertyCardSkeleton key={idx} />
      ))}
    </div>
  );
}

export default PropertyCardSkeleton;
