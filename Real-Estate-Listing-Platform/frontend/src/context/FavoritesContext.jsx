import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import { getSavedFavorites, saveFavorites, toggleFavorite as syncToggleFavorite } from '../utils/favorites';

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => getSavedFavorites());
  const [loading, setLoading] = useState(false);
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true' || Boolean(localStorage.getItem('token'));

  // Sync with API on login state or mount
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchFavorites = async () => {
      setLoading(true);
      try {
        const response = await api.get('/api/favorites');
        const list = response.data?.data || response.data?.favorites || response.data;
        if (Array.isArray(list)) {
          saveFavorites(list);
          setFavorites(list);
        }
      } catch (err) {
        console.warn('API error, relying on local favorites storage: ', err);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [isLoggedIn]);

  // Sync cross-tab/cross-component modifications using the window event
  useEffect(() => {
    const handleSync = (e) => {
      if (e.detail?.favorites) {
        setFavorites(e.detail.favorites);
      } else {
        setFavorites(getSavedFavorites());
      }
    };

    window.addEventListener('favorites-updated', handleSync);
    return () => window.removeEventListener('favorites-updated', handleSync);
  }, []);

  const toggleFavorite = (property) => {
    const isSaved = syncToggleFavorite(property);
    // State will be updated by handleSync event listener
    return isSaved;
  };

  const isFavorite = (propertyId) => {
    return favorites.some(p => {
      if (typeof p === 'string') return p === propertyId;
      return (p._id || p.id) === propertyId;
    });
  };

  return (
    <FavoritesContext.Provider value={{ favorites, loading, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
