import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  Map as MapIcon,
  ChevronDown,
  Plus,
  Minus,
  X
} from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';
import { INDIA_LOCATIONS } from '../../data/indiaLocations';
import formatPrice from '../../utils/formatPrice';

export default function FilterBar({
  filters,
  onChangeFilter,
  onOpenMoreFilters,
  viewMode,
  onChangeViewMode
}) {
  // Local state for search input to ensure zero lag while typing
  const [searchInput, setSearchInput] = useState(filters.search || '');
  const debouncedSearch = useDebounce(searchInput, 300);

  // Sync debounced search to parent filter
  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onChangeFilter('search', debouncedSearch);
    }
  }, [debouncedSearch]);

  // Sync external search changes to local search input
  useEffect(() => {
    if (filters.search !== searchInput) {
      setSearchInput(filters.search || '');
    }
  }, [filters.search]);

  // Price range popover state
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const pricePopoverRef = useRef(null);

  // Close price popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pricePopoverRef.current && !pricePopoverRef.current.contains(e.target)) {
        setIsPriceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const minPrice = filters.minPrice !== '' ? Number(filters.minPrice) : 0;
  // Active amenity count
  const activeAmenitiesCount = (filters.amenities || []).length;
  const activeMoreFiltersCount =
    activeAmenitiesCount + (filters.bathrooms ? 1 : 0) + (filters.type && filters.type !== 'all' ? 1 : 0) + (filters.luxury ? 1 : 0);
  const maxPrice = filters.maxPrice !== '' ? Number(filters.maxPrice) : 200000000;
  const cityOptions = filters.state ? INDIA_LOCATIONS[filters.state] || [] : [...new Set(Object.values(INDIA_LOCATIONS).flat())].sort();

  // Handle Bedrooms stepper
  const handleBedroomStep = (delta) => {
    const current = filters.bedrooms ? parseInt(filters.bedrooms, 10) : 0;
    const nextVal = Math.max(0, current + delta);
    onChangeFilter('bedrooms', nextVal === 0 ? '' : String(nextVal));
  };

  const currentBedrooms = filters.bedrooms ? parseInt(filters.bedrooms, 10) : 0;

  return (
    <div
      style={{
        position: 'sticky',
        top: '80px',
        zIndex: 900,
        backgroundColor: '#ffffff',
        borderBottom: '1px solid var(--border)',
        boxShadow: '0 4px 12px rgba(18, 24, 36, 0.03)',
        padding: '14px 0'
      }}
    >
      <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        
        {/* 1. Search Input (Debounced 300ms) */}
        <div style={{ flex: '1 1 240px', minWidth: '200px', position: 'relative' }}>
          <Search
            size={18}
            style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
          <input
            type="text"
            placeholder="Search by city, title, or location..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 36px 10px 42px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: 'var(--bg-offset)',
              fontSize: '14px',
              color: 'var(--text-dark)',
              outline: 'none',
              transition: 'all 0.2s ease'
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('');
                onChangeFilter('search', '');
              }}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>
        <div style={{ flex: '0 0 auto', position: 'relative' }}>
          <select
            aria-label="Filter by state"
            value={filters.state || ''}
            onChange={(e) => onChangeFilter('state', e.target.value)}
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text-dark)', fontSize: '13px', maxWidth: '150px' }}
          >
            <option value="">All States</option>
            {Object.keys(INDIA_LOCATIONS).map((state) => <option key={state} value={state}>{state}</option>)}
          </select>
        </div>

        <div style={{ flex: '0 0 auto', position: 'relative' }}>
          <select
            aria-label="Filter by city"
            value={filters.city || ''}
            onChange={(e) => onChangeFilter('city', e.target.value)}
            style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: '#fff', color: 'var(--text-dark)', fontSize: '13px', maxWidth: '160px' }}
          >
            <option value="">All Cities</option>
            {cityOptions.map((city) => <option key={city} value={city}>{city}</option>)}
          </select>
        </div>

        {/* 2. Property Type Select */}
        <div style={{ flex: '0 0 auto', position: 'relative' }}>
          <select
            value={filters.propertyType || 'all'}
            onChange={(e) => onChangeFilter('propertyType', e.target.value)}
            style={{
              appearance: 'none',
              padding: '10px 34px 10px 14px',
              borderRadius: '10px',
              border: '1px solid var(--border)',
              backgroundColor: '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-dark)',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            <option value="all">All Property Types</option>
            <option value="villa">Villa</option>
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="commercial">Commercial</option>
            <option value="plot">Plot / Land</option>
          </select>
          <ChevronDown
            size={16}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* 3. Price Range Dual Slider Dropdown */}
        <div style={{ position: 'relative', flex: '0 0 auto' }} ref={pricePopoverRef}>
          <button
            type="button"
            onClick={() => setIsPriceOpen(!isPriceOpen)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '10px',
              border: filters.minPrice || filters.maxPrice ? '1px solid var(--primary)' : '1px solid var(--border)',
              backgroundColor: filters.minPrice || filters.maxPrice ? 'var(--primary-light)' : '#ffffff',
              fontSize: '14px',
              fontWeight: 500,
              color: filters.minPrice || filters.maxPrice ? 'var(--primary)' : 'var(--text-dark)',
              cursor: 'pointer'
            }}
          >
            <span>
              {!filters.minPrice && !filters.maxPrice
                ? 'Price Range'
                : `${formatPrice(minPrice)} - ${filters.maxPrice ? formatPrice(maxPrice) : 'Max'}`}
            </span>
            <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />
          </button>

          {isPriceOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '320px',
                backgroundColor: '#ffffff',
                border: '1px solid var(--border)',
                borderRadius: '14px',
                boxShadow: 'var(--shadow-lg)',
                padding: '20px',
                zIndex: 1000,
                animation: 'fadeIn 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--text-dark)' }}>Price Range</span>
                <button
                  type="button"
                  onClick={() => {
                    onChangeFilter('minPrice', '');
                    onChangeFilter('maxPrice', '');
                  }}
                  style={{ fontSize: '12px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                >
                  Reset
                </button>
              </div>

              {/* Sliders container */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Min Price</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                      {formatPrice(minPrice)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="200000000"
                    step="1000000"
                    value={minPrice}
                    onChange={(e) => onChangeFilter('minPrice', e.target.value === '0' ? '' : e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                    <span>Max Price</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-dark)' }}>
                      {filters.maxPrice ? formatPrice(maxPrice) : 'No Limit'}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="100000"
                    max="200000000"
                    step="1000000"
                    value={maxPrice}
                    onChange={(e) => onChangeFilter('maxPrice', e.target.value)}
                    style={{ width: '100%', accentColor: 'var(--primary)' }}
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPriceOpen(false)}
                style={{
                  width: '100%',
                  marginTop: '18px',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'var(--primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Apply Range
              </button>
            </div>
          )}
        </div>

        {/* 4. Bedrooms Stepper */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 6px',
            borderRadius: '10px',
            border: filters.bedrooms ? '1px solid var(--primary)' : '1px solid var(--border)',
            backgroundColor: filters.bedrooms ? 'var(--primary-light)' : '#ffffff'
          }}
        >
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-dark)', paddingLeft: '8px' }}>
            Beds: {currentBedrooms === 0 ? 'Any' : `${currentBedrooms}+`}
          </span>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => handleBedroomStep(-1)}
              disabled={currentBedrooms === 0}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: currentBedrooms === 0 ? '#f1f5f9' : '#ffffff',
                color: currentBedrooms === 0 ? 'var(--text-muted)' : 'var(--text-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: currentBedrooms === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              <Minus size={14} />
            </button>
            <button
              type="button"
              onClick={() => handleBedroomStep(1)}
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                border: '1px solid var(--border)',
                backgroundColor: '#ffffff',
                color: 'var(--text-dark)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* 5. "More Filters" Button */}
        <button
          type="button"
          onClick={onOpenMoreFilters}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            borderRadius: '10px',
            border: activeMoreFiltersCount > 0 ? '1px solid var(--primary)' : '1px solid var(--border)',
            backgroundColor: activeMoreFiltersCount > 0 ? 'var(--primary-light)' : '#ffffff',
            color: activeMoreFiltersCount > 0 ? 'var(--primary)' : 'var(--text-dark)',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <SlidersHorizontal size={16} />
          <span>More Filters</span>
          {activeMoreFiltersCount > 0 && (
            <span
              style={{
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                borderRadius: '12px',
                padding: '2px 8px',
                fontSize: '11px',
                fontWeight: 700
              }}
            >
              {activeMoreFiltersCount}
            </span>
          )}
        </button>

        {/* 6. Grid / Map View Toggle Switch (Far Right) */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '4px', backgroundColor: 'var(--bg-offset)', padding: '4px', borderRadius: '10px', border: '1px solid var(--border)' }}>
          <button
            type="button"
            onClick={() => onChangeViewMode('grid')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: viewMode === 'grid' ? '#ffffff' : 'transparent',
              color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'grid' ? 'var(--shadow-sm)' : 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <LayoutGrid size={16} />
            <span>Grid</span>
          </button>
          <button
            type="button"
            onClick={() => onChangeViewMode('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: viewMode === 'map' ? '#ffffff' : 'transparent',
              color: viewMode === 'map' ? 'var(--primary)' : 'var(--text-muted)',
              boxShadow: viewMode === 'map' ? 'var(--shadow-sm)' : 'none',
              fontWeight: 600,
              fontSize: '13px',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <MapIcon size={16} />
            <span>Map</span>
          </button>
        </div>

      </div>
    </div>
  );
}
