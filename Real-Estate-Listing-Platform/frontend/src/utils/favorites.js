import api from '../api/axios';

const FAVORITES_KEY = 'user_favorites';

/**
 * Reads favorited properties from localStorage synchronously.
 * Returns an empty list when no saved homes exist.
 */
export function getSavedFavorites() {
  try {
    const stored = localStorage.getItem(FAVORITES_KEY) || localStorage.getItem('user_favorites_cache');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading favorites from localStorage:', err);
  }

  return [];
}

/**
 * Checks if a property with given ID is currently favorited.
 */
export function isPropertyFavorited(propertyId) {
  if (!propertyId) return false;
  const current = getSavedFavorites();
  return current.some((p) => {
    if (typeof p === 'string') return p === propertyId;
    return (p._id || p.id) === propertyId;
  });
}

/**
 * Toggles a property in favorites synchronously in local storage,
 * dispatches a window event for real-time app state sync, and
 * triggers background API update.
 */
export function toggleFavorite(property) {
  if (!property) return false;
  const propertyId = property._id || property.id;
  const current = getSavedFavorites();

  const isAlreadySaved = current.some((p) => {
    if (typeof p === 'string') return p === propertyId;
    return (p._id || p.id) === propertyId;
  });

  let updated;
  if (isAlreadySaved) {
    updated = current.filter((p) => {
      if (typeof p === 'string') return p !== propertyId;
      return (p._id || p.id) !== propertyId;
    });
  } else {
    updated = [property, ...current];
  }

  // Write synchronously to localStorage
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    localStorage.setItem('user_favorites_cache', JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to update favorites in localStorage:', err);
  }

  // Broadcast window event for instant cross-component UI synchronization
  window.dispatchEvent(new CustomEvent('favorites-updated', {
    detail: { propertyId, isFavorited: !isAlreadySaved, favorites: updated }
  }));

  // Background API call
  api.post(`/api/favorites/${propertyId}`).catch(() => {
    // Offline / mock mode fallback
  });

  return !isAlreadySaved;
}

/**
 * Overwrites/syncs favorites array in local storage (e.g. from API response).
 */
export function saveFavorites(favoritesList) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesList));
    localStorage.setItem('user_favorites_cache', JSON.stringify(favoritesList));
    window.dispatchEvent(new CustomEvent('favorites-updated', {
      detail: { favorites: favoritesList }
    }));
  } catch (err) {
    console.error('Error saving favorites:', err);
  }
}
