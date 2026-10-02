import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  FilterX,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  SlidersHorizontal,
  Home
} from 'lucide-react';
import PropertyCard from '../components/property/PropertyCard';
import CompactPropertyCard from '../components/property/CompactPropertyCard';
import PropertyGridSkeleton, { PropertyCardSkeleton } from '../components/property/PropertySkeleton';
import FilterBar from '../components/filters/FilterBar';
import MoreFiltersModal from '../components/filters/MoreFiltersModal';
import ListingsMap from '../components/map/ListingsMap';
import { INDIA_PROPERTIES } from '../data/indiaProperties';
import { getProperties } from '../api/properties.api';

const ITEMS_PER_PAGE = 6;

export default function Listings() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Parse filters from URL
  const filters = useMemo(() => {
    const amenitiesParam = searchParams.get('amenities');
    return {
      search: searchParams.get('search') || '',
      city: searchParams.get('city') || '',
      state: searchParams.get('state') || '',
      country: searchParams.get('country') || '',
      type: searchParams.get('type') || 'all',
      propertyType: searchParams.get('propertyType') || 'all',
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      luxury: searchParams.get('luxury') === 'true',
      bedrooms: searchParams.get('bedrooms') || '',
      bathrooms: searchParams.get('bathrooms') || '',
      amenities: amenitiesParam ? amenitiesParam.split(',') : [],
      sort: searchParams.get('sort') || 'newest',
      page: parseInt(searchParams.get('page') || '1', 10),
      view: searchParams.get('view') || 'grid'
    };
  }, [searchParams]);

  // Modal state
  const [isMoreFiltersOpen, setIsMoreFiltersOpen] = useState(false);

  // Hover & selection state for map sync
  const [hoveredPropertyId, setHoveredPropertyId] = useState(null);
  const [selectedPropertyId, setSelectedPropertyId] = useState(null);

  // Fetch / Data state
  const [properties, setProperties] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper to sync filters to URL search params
  const updateURLParams = useCallback((newFilters) => {
    const params = new URLSearchParams();

    if (newFilters.search) params.set('search', newFilters.search);
    if (newFilters.city) params.set('city', newFilters.city);
    if (newFilters.state) params.set('state', newFilters.state);
    if (newFilters.country) params.set('country', newFilters.country);
    if (newFilters.type && newFilters.type !== 'all') params.set('type', newFilters.type);
    if (newFilters.propertyType && newFilters.propertyType !== 'all') params.set('propertyType', newFilters.propertyType);
    if (newFilters.minPrice) params.set('minPrice', newFilters.minPrice);
    if (newFilters.maxPrice) params.set('maxPrice', newFilters.maxPrice);
      if (newFilters.luxury) params.set('luxury', 'true');
    if (newFilters.bedrooms) params.set('bedrooms', newFilters.bedrooms);
    if (newFilters.bathrooms) params.set('bathrooms', newFilters.bathrooms);
    if (newFilters.amenities && newFilters.amenities.length > 0) {
      params.set('amenities', newFilters.amenities.join(','));
    }
    if (newFilters.sort && newFilters.sort !== 'newest') params.set('sort', newFilters.sort);
    if (newFilters.page && newFilters.page > 1) params.set('page', String(newFilters.page));
    if (newFilters.view && newFilters.view !== 'grid') params.set('view', newFilters.view);

    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  // Handle individual filter parameter changes
  const handleFilterChange = (key, value) => {
    const updated = {
      ...filters,
      [key]: value,
      ...(key === 'state' ? { city: '' } : {}),
      // Reset page to 1 whenever any filter (except page itself) changes
      page: key === 'page' ? value : 1
    };
    updateURLParams(updated);
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchParams({}, { replace: true });
  };

  // Fetch properties from backend API with fallback to client-side filtered mock properties
  useEffect(() => {
    setLoading(true);

    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.city) params.city = filters.city;
    if (filters.state) params.state = filters.state;
    if (filters.country) params.country = filters.country;
    if (filters.type && filters.type !== 'all') params.type = filters.type;
    if (filters.propertyType && filters.propertyType !== 'all') params.propertyType = filters.propertyType;
    if (filters.minPrice) params.minPrice = filters.minPrice;
    if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.luxury) params.minPrice = Math.max(Number(params.minPrice) || 0, 20000000);
    if (filters.bedrooms) params.bedrooms = filters.bedrooms;
    if (filters.bathrooms) params.bathrooms = filters.bathrooms;
    if (filters.amenities && filters.amenities.length > 0) params.amenities = filters.amenities.join(',');
    if (filters.sort) params.sort = filters.sort;
    params.page = filters.page;
    params.limit = ITEMS_PER_PAGE;

    let isSubscribed = true;

    // Try fetching from real API using Axios
    getProperties(params)
      .then((resData) => {
        if (isSubscribed) {
          const list = resData.data || resData.properties || resData;
          setProperties(Array.isArray(list) ? list : []);
          setTotalCount(resData.total || (Array.isArray(list) ? list.length : 0));
          setLoading(false);
        }
      })
      .catch((err) => {
        // Fallback: Perform accurate client-side filtering on custom and mock properties
        const customPropsStr = localStorage.getItem('custom_properties');
        const customProps = customPropsStr ? JSON.parse(customPropsStr) : [];
        let result = [...customProps, ...INDIA_PROPERTIES];

        // 1. Text Search (title, description, city, street, country)
        if (filters.search) {
          const q = filters.search.toLowerCase();
          result = result.filter((p) =>
            (p.title && p.title.toLowerCase().includes(q)) ||
            (p.description && p.description.toLowerCase().includes(q)) ||
            (p.address?.city && p.address.city.toLowerCase().includes(q)) ||
            (p.address?.street && p.address.street.toLowerCase().includes(q)) ||
            (p.address?.country && p.address.country.toLowerCase().includes(q))
          );
        }

        // 2. City Filter
        if (filters.city) {
          const c = filters.city.toLowerCase();
          result = result.filter((p) => p.address?.city?.toLowerCase() === c);
        }

        if (filters.state) {
          const stateName = filters.state.toLowerCase();
          result = result.filter((p) => p.address?.state?.toLowerCase() === stateName);
        }

        // 2b. Country Filter
        if (filters.country) {
          const c = filters.country.toLowerCase();
          result = result.filter((p) => p.address?.country?.toLowerCase() === c);
        }

        // 3. Listing Type (sale / rent)
        if (filters.type && filters.type !== 'all') {
          result = result.filter((p) => p.type === filters.type);
        }

        // 4. Property Type (villa, apartment, house, commercial, plot)
        if (filters.propertyType && filters.propertyType !== 'all') {
          result = result.filter((p) => p.propertyType === filters.propertyType);
        }

        // 5. Min Price
        if (filters.minPrice) {
          const min = Number(filters.minPrice);
          result = result.filter((p) => p.price >= min);
        }

        // 6. Max Price
        if (filters.maxPrice) {
          const max = Number(filters.maxPrice);
          result = result.filter((p) => p.price <= max);
        }

        if (filters.luxury) {
          result = result.filter((p) => p.price >= 20000000);
        }

        // 7. Bedrooms
        if (filters.bedrooms) {
          const beds = Number(filters.bedrooms);
          result = result.filter((p) => p.bedrooms >= beds);
        }

        // 8. Bathrooms
        if (filters.bathrooms) {
          const baths = Number(filters.bathrooms);
          result = result.filter((p) => p.bathrooms >= baths);
        }

        // 9. Amenities
        if (filters.amenities.length > 0) {
          result = result.filter((p) =>
            filters.amenities.every((amenity) => p.amenities && p.amenities.includes(amenity))
          );
        }

        // 10. Sorting
        if (filters.sort === 'price_asc' || filters.sort === 'price') {
          result.sort((a, b) => a.price - b.price);
        } else if (filters.sort === 'price_desc' || filters.sort === '-price') {
          result.sort((a, b) => b.price - a.price);
        } else {
          // Newest first
          result.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        if (isSubscribed) {
          setTotalCount(result.length);

          // 11. Pagination
          const startIdx = (filters.page - 1) * ITEMS_PER_PAGE;
          const paginatedResult = result.slice(startIdx, startIdx + ITEMS_PER_PAGE);

          setProperties(paginatedResult);
          setLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [filters]);

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;

  return (
    <div style={{ backgroundColor: '#ffffff', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
      
      {/* Sticky Filter Bar */}
      <FilterBar
        filters={filters}
        onChangeFilter={handleFilterChange}
        onOpenMoreFilters={() => setIsMoreFiltersOpen(true)}
        viewMode={filters.view}
        onChangeViewMode={(v) => handleFilterChange('view', v)}
      />

      {/* Slide-in More Filters Panel */}
      <MoreFiltersModal
        isOpen={isMoreFiltersOpen}
        onClose={() => setIsMoreFiltersOpen(false)}
        filters={filters}
        onChangeFilter={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      {/* Main Content Area */}
      <div className="container" style={{ flexGrow: 1, padding: '24px 24px 60px 24px', display: 'flex', flexDirection: 'column' }}>
        
        {/* Results Header (Count & Sort Controls) */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '12px'
          }}
        >
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-dark)' }}>
              {filters.city ? `${filters.city} Properties` : 'Property Listings'}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {loading ? 'Searching properties...' : `Showing ${totalCount} property results`}
            </p>
          </div>

          {/* Sort Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowUpDown size={14} /> Sort:
            </span>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: '#ffffff',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-dark)',
                cursor: 'pointer',
                outline: 'none'
              }}
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading State: Skeleton Cards */}
        {loading ? (
          filters.view === 'grid' ? (
            <PropertyGridSkeleton count={6} />
          ) : (
            <div style={{ display: 'flex', gap: '24px', height: 'calc(100vh - 240px)', minHeight: '550px' }}>
              <div style={{ width: '40%', display: 'flex', flexDirection: 'column', gap: '14px', overflowY: 'auto' }}>
                {Array.from({ length: 4 }).map((_, idx) => (
                  <div key={idx} className="skeleton" style={{ height: '110px', borderRadius: '14px' }} />
                ))}
              </div>
              <div className="skeleton" style={{ width: '60%', height: '100%', borderRadius: '16px' }} />
            </div>
          )
        ) : properties.length === 0 ? (
          /* Empty State */
          <div
            style={{
              padding: '80px 24px',
              textAlign: 'center',
              backgroundColor: 'var(--bg-offset)',
              borderRadius: '20px',
              border: '1px solid var(--border)',
              margin: '20px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-light)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FilterX size={32} />
            </div>

            <div>
              <h2 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--text-dark)', marginBottom: '6px' }}>
                No Matching Properties Found
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', maxWidth: '450px', margin: '0 auto' }}>
                We couldn't find any properties matching your selected filter criteria. Try relaxing your search terms or clearing active filters.
              </p>
            </div>

            <button
              onClick={handleResetFilters}
              style={{
                padding: '12px 24px',
                borderRadius: '10px',
                backgroundColor: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s ease',
                marginTop: '8px'
              }}
              onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary-hover)')}
              onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--primary)')}
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          /* View Modes: Grid View vs Map View */
          filters.view === 'grid' ? (
            /* GRID VIEW: 3-column responsive grid */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '40px', flexGrow: 1 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
                  gap: '28px'
                }}
              >
                {properties.map((property, idx) => (
                  <div
                    key={property._id || property.id}
                    className="stagger-card"
                    style={{ animationDelay: `${idx * 80}ms` }}
                  >
                    <PropertyCard property={property} />
                  </div>
                ))}
              </div>

              {/* Pagination Controls at Bottom */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: 'auto',
                    paddingTop: '20px'
                  }}
                >
                  <button
                    disabled={filters.page <= 1}
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: filters.page <= 1 ? '#f1f5f9' : '#ffffff',
                      color: filters.page <= 1 ? 'var(--text-muted)' : 'var(--text-dark)',
                      cursor: filters.page <= 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    <ChevronLeft size={16} /> Previous
                  </button>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pNum = i + 1;
                      const isActive = filters.page === pNum;
                      return (
                        <button
                          key={pNum}
                          onClick={() => handleFilterChange('page', pNum)}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: isActive ? '2px solid var(--primary)' : '1px solid var(--border)',
                            backgroundColor: isActive ? 'var(--primary)' : '#ffffff',
                            color: isActive ? '#ffffff' : 'var(--text-dark)',
                            fontWeight: 700,
                            fontSize: '13px',
                            cursor: 'pointer'
                          }}
                        >
                          {pNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    disabled={filters.page >= totalPages}
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                      backgroundColor: filters.page >= totalPages ? '#f1f5f9' : '#ffffff',
                      color: filters.page >= totalPages ? 'var(--text-muted)' : 'var(--text-dark)',
                      cursor: filters.page >= totalPages ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                      fontWeight: 600
                    }}
                  >
                    Next <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* MAP VIEW: Split layout (Left 40% compact scroll list, Right 60% Leaflet map) */
            <div
              style={{
                display: 'flex',
                gap: '24px',
                height: 'calc(100vh - 230px)',
                minHeight: '550px',
                flexWrap: 'wrap'
              }}
            >
              {/* Left 40%: Compact Scrollable Results List */}
              <div
                className="hide-scrollbar"
                style={{
                  flex: '1 1 360px',
                  maxWidth: '440px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '14px',
                  overflowY: 'auto',
                  paddingRight: '6px'
                }}
              >
                {properties.map((property, idx) => {
                  const propId = property._id || property.id;
                  return (
                    <div
                      key={propId}
                      className="stagger-card"
                      style={{ animationDelay: `${idx * 60}ms` }}
                    >
                      <CompactPropertyCard
                        property={property}
                        isHovered={hoveredPropertyId === propId}
                        isSelected={selectedPropertyId === propId}
                        onMouseEnter={() => setHoveredPropertyId(propId)}
                        onMouseLeave={() => setHoveredPropertyId(null)}
                        onClick={() => setSelectedPropertyId(propId)}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Right 60%: Interactive Leaflet Map */}
              <div style={{ flex: '2 1 500px', height: '100%', position: 'relative' }}>
                <ListingsMap
                  properties={properties}
                  hoveredPropertyId={hoveredPropertyId}
                  selectedPropertyId={selectedPropertyId}
                  onSelectProperty={(id) => setSelectedPropertyId(id)}
                  onHoverProperty={(id) => setHoveredPropertyId(id)}
                />
              </div>
            </div>
          )
        )}

      </div>
    </div>
  );
}
