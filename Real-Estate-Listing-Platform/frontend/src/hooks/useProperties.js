import { useState, useEffect, useCallback } from 'react';
import { getProperties } from '../api/properties.api';
import { MOCK_PROPERTIES } from '../data/mockProperties';

export default function useProperties(filters = {}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchProperties = useCallback(async (currentFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getProperties(currentFilters);
      if (result && result.success) {
        setProperties(result.data || []);
        setTotal(result.total || result.count || 0);
      } else {
        throw new Error(result?.error || 'Failed to fetch properties');
      }
    } catch (err) {
      console.warn('API error, falling back to local mock data: ', err);
      // Fallback filter implementation for offline mode
      let filtered = [...MOCK_PROPERTIES];

      if (currentFilters.city) {
        filtered = filtered.filter(p => p.address.city.toLowerCase() === currentFilters.city.toLowerCase());
      }
      if (currentFilters.type) {
        filtered = filtered.filter(p => p.type === currentFilters.type);
      }
      if (currentFilters.propertyType) {
        filtered = filtered.filter(p => p.propertyType === currentFilters.propertyType);
      }
      if (currentFilters.bedrooms) {
        filtered = filtered.filter(p => p.bedrooms >= parseInt(currentFilters.bedrooms));
      }
      if (currentFilters.price && currentFilters.price.$gte) {
        filtered = filtered.filter(p => p.price >= currentFilters.price.$gte);
      }
      if (currentFilters.price && currentFilters.price.$lte) {
        filtered = filtered.filter(p => p.price <= currentFilters.price.$lte);
      }
      if (currentFilters.search) {
        const term = currentFilters.search.toLowerCase();
        filtered = filtered.filter(p => 
          p.title.toLowerCase().includes(term) || 
          p.description.toLowerCase().includes(term) ||
          p.address.city.toLowerCase().includes(term)
        );
      }

      setProperties(filtered);
      setTotal(filtered.length);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties(filters);
  }, [JSON.stringify(filters), fetchProperties]);

  return {
    properties,
    loading,
    error,
    total,
    refresh: () => fetchProperties(filters)
  };
}
