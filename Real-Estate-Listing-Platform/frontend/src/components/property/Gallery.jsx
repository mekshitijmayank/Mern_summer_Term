import React, { useState } from 'react';

export default function Gallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const fallbackImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80';
  const displayImages = images.length > 0 ? images : [fallbackImage];
  const activeImage = displayImages[activeIndex];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Main Image Frame */}
      <div style={{
        position: 'relative',
        width: '100%',
        paddingTop: '56.25%', // 16:9 Aspect Ratio
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        backgroundColor: '#f1f5f9'
      }}>
        <img 
          src={activeImage} 
          alt="Property View" 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'all 0.5s ease'
          }}
        />
      </div>

      {/* Thumbnails list */}
      {displayImages.length > 1 && (
        <div style={{
          display: 'flex',
          gap: '12px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'thin'
        }}>
          {displayImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              style={{
                position: 'relative',
                width: '100px',
                height: '66px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: activeIndex === index ? '2px solid var(--primary)' : '1px solid var(--border)',
                padding: 0,
                backgroundColor: '#ffffff',
                cursor: 'pointer',
                flexShrink: 0,
                transition: 'border-color 0.2s ease, transform 0.2s ease',
                transform: activeIndex === index ? 'scale(1.02)' : 'none'
              }}
            >
              <img 
                src={img} 
                alt={`View ${index + 1}`} 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  opacity: activeIndex === index ? 1 : 0.75,
                  transition: 'opacity 0.2s ease'
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
