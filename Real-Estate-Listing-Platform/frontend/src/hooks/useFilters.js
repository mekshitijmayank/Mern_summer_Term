import { useSearchParams } from 'react-router-dom';
import { useMemo, useCallback } from 'react';

const DEFAULT_FILTERS = {
  search: '',
  city: '',
  type: '',
  propertyType: '',
  bedrooms: '',
  minPrice: '',
  maxPrice: '',
  sort: '-createdAt',
  page: '1'
};

export default function useFilters() {
  const [searchParams, setSearchParams] = useSearchParams();

  const filters = useMemo(() => {
    const active = {};
    Object.keys(DEFAULT_FILTERS).forEach(key => {
      active[key] = searchParams.get(key) || DEFAULT_FILTERS[key];
    });
    return active;
  }, [searchParams]);

  const setFilter = useCallback((key, value) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      if (value === undefined || value === null || value === '' || value === DEFAULT_FILTERS[key]) {
        next.delete(key);
      } else {
        next.set(key, value.toString());
      }
      // Reset page to 1 on any filter change except page itself
      if (key !== 'page') {
        next.delete('page');
      }
      return next;
    });
  }, [setSearchParams]);

  const setFilters = useCallback((newFilters) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '' || value === DEFAULT_FILTERS[key]) {
          next.delete(key);
        } else {
          next.set(key, value.toString());
        }
      });
      next.delete('page'); // Reset pagination
      return next;
    });
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  return {
    filters,
    setFilter,
    setFilters,
    clearFilters
  };
}
