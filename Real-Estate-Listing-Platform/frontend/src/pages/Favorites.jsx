import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, HeartOff, ArrowRight, Sparkles, Building2, Trash2 } from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import { PropertyGridSkeleton } from '../components/property/PropertySkeleton';
import api from '../api/axios';
import { getSavedFavorites, saveFavorites } from '../utils/favorites';

export default function Favorites() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState(() => getSavedFavorites());
  const [loading, setLoading] = useState(false);
  const [exitingIds, setExitingIds] = useState(new Set());
  const [notification, setNotification] = useState(null);

  // Check auth on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    
    if (!isLoggedIn && !token) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Synchronous load & real-time event sync with API background update
  useEffect(() => {
    let isMounted = true;

    const fetchFavorites = async () => {
      try {
        const response = await api.get('/api/favorites');
        if (isMounted) {
          const list = response.data?.data || response.data?.favorites || response.data;
          if (Array.isArray(list) && list.length >= 0) {
            saveFavorites(list);
            setFavorites(list);
          }
        }
      } catch (err) {
        // Fallback for offline mode: storage remains master
      }
    };

    fetchFavorites();

    const handleSync = (e) => {
      if (isMounted) {
        if (e.detail?.favorites) {
          setFavorites(e.detail.favorites);
        } else {
          setFavorites(getSavedFavorites());
        }
      }
    };

    window.addEventListener('favorites-updated', handleSync);

    return () => {
      isMounted = false;
      window.removeEventListener('favorites-updated', handleSync);
    };
  }, []);

  // Show auto-dismiss toast notification
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle removing a property from favorites with fade + slide animation
  const handleRemoveFavorite = useCallback(async (property, isFavorited) => {
    if (!isFavorited) {
      const propertyId = property._id || property.id;

      // Mark property as exiting for 350ms animation
      setExitingIds((prev) => new Set(prev).add(propertyId));

      showToast(`Removed "${property.title || 'Property'}" from your saved homes`);

      // Wait 350ms for CSS transition before removing from React local state
      setTimeout(() => {
        setFavorites((prev) => {
          const updated = prev.filter((p) => (p._id || p.id) !== propertyId);
          saveFavorites(updated);
          return updated;
        });
        setExitingIds((prev) => {
          const next = new Set(prev);
          next.delete(propertyId);
          return next;
        });
      }, 350);
    }
  }, []);

  return (
    <div style={{
      minHeight: '85vh',
      backgroundColor: 'var(--bg-offset)',
      paddingTop: '48px',
      paddingBottom: '80px'
    }}>
      <div className="container">

        {/* Header Section */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '40px'
        }}>
          {/* Breadcrumb / Category Tag */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--primary)',
            fontSize: '13px',
            fontWeight: 700,
            letterSpacing: '1px',
            textTransform: 'uppercase'
          }}>
            <Heart size={15} style={{ fill: 'var(--primary)' }} />
            <span>Saved Collection</span>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            flexWrap: 'wrap',
            gap: '16px'
          }}>
            <div>
              <h1 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 800,
                color: 'var(--text-dark)',
                lineHeight: 1.2,
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                Your Saved Homes
                {!loading && (
                  <span style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    fontFamily: 'var(--font-sans)',
                    backgroundColor: 'rgba(197, 160, 89, 0.15)',
                    color: 'var(--primary)',
                    padding: '4px 14px',
                    borderRadius: '50px',
                    border: '1px solid rgba(197, 160, 89, 0.3)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {favorites.length} {favorites.length === 1 ? 'Home' : 'Homes'}
                  </span>
                )}
              </h1>
              <p style={{
                color: 'var(--text-muted)',
                fontSize: '15px',
                marginTop: '6px'
              }}>
                Manage and track all your saved luxury real estate properties in one place.
              </p>
            </div>

            {favorites.length > 0 && !loading && (
              <Link to="/listings" style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--primary)',
                textDecoration: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                transition: 'all 0.2s ease',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <span>Explore More Properties</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        </div>

        {/* Toast Notification Banner */}
        {notification && (
          <div style={{
            marginBottom: '24px',
            padding: '12px 20px',
            backgroundColor: '#121824',
            color: '#ffffff',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Trash2 size={16} style={{ color: '#f43f5e' }} />
              <span>{notification}</span>
            </div>
            <button 
              onClick={() => setNotification(null)} 
              style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px' }}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Content Area */}
        {loading ? (
          /* Loading Skeletons */
          <PropertyGridSkeleton count={3} />
        ) : favorites.length > 0 ? (
          /* 3-Column Property Grid */
          <div className="favorites-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '28px',
            width: '100%'
          }}>
            {favorites.map((property) => {
              const pId = property._id || property.id;
              const isExiting = exitingIds.has(pId);

              return (
                <div
                  key={pId}
                  className={`favorite-card-container ${isExiting ? 'exiting' : ''}`}
                  style={{
                    transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.35s cubic-bezier(0.4, 0, 0.2, 1), filter 0.35s ease',
                    opacity: isExiting ? 0 : 1,
                    transform: isExiting ? 'translateY(-18px) scale(0.92)' : 'translateY(0) scale(1)',
                    filter: isExiting ? 'blur(4px)' : 'none',
                    pointerEvents: isExiting ? 'none' : 'auto'
                  }}
                >
                  <PropertyCard
                    property={property}
                    isFavorited={true}
                    onFavoriteToggle={handleRemoveFavorite}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State (Zero Favorites) */
          <div style={{
            backgroundColor: '#ffffff',
            border: '1px solid var(--border)',
            borderRadius: '24px',
            padding: '72px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxWidth: '560px',
            margin: '40px auto 0 auto',
            boxShadow: 'var(--shadow)'
          }}>
            {/* Centered Illustration / Icon */}
            <div style={{
              width: '96px',
              height: '96px',
              borderRadius: '50%',
              backgroundColor: 'rgba(197, 160, 89, 0.1)',
              border: '1px solid rgba(197, 160, 89, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              position: 'relative'
            }}>
              <HeartOff size={44} style={{ color: 'var(--primary)', strokeWidth: 1.5 }} />
              <div style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                backgroundColor: 'var(--primary)',
                borderRadius: '50%',
                padding: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(197, 160, 89, 0.4)'
              }}>
                <Sparkles size={14} style={{ color: '#ffffff' }} />
              </div>
            </div>

            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '26px',
              fontWeight: 700,
              color: 'var(--text-dark)',
              marginBottom: '12px'
            }}>
              No Saved Homes Yet
            </h2>

            <p style={{
              color: 'var(--text-muted)',
              fontSize: '15px',
              lineHeight: 1.6,
              maxWidth: '420px',
              marginBottom: '32px'
            }}>
              You haven't added any properties to your favorites list. Explore our available listings and tap the heart icon on any home to save it for quick reference later.
            </p>

            <Link
              to="/listings"
              style={{
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                padding: '14px 32px',
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '15px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                textDecoration: 'none',
                boxShadow: '0 8px 20px rgba(197, 160, 89, 0.25)',
                transition: 'all 0.2s ease'
              }}
              className="empty-state-btn"
            >
              <Building2 size={18} />
              <span>Browse Properties</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        )}

      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .empty-state-btn:hover {
          background-color: var(--primary-hover) !important;
          transform: translateY(-2px);
          box-shadow: 0 12px 24px rgba(197, 160, 89, 0.35) !important;
        }
      `}</style>
    </div>
  );
}
