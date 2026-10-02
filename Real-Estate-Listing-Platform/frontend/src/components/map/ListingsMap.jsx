import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import { Bed, Bath, Square, MapPin } from 'lucide-react';
import formatPrice from '../../utils/formatPrice';

// Keep map labels compact while preserving Indian numbering units.
function formatPriceCompact(price) {
  if (!price && price !== 0) return '₹0';
  if (price >= 10000000) {
    const crore = price / 10000000;
    return `₹${Number(crore.toFixed(1))} Cr`;
  }
  if (price >= 100000) {
    const lakh = price / 100000;
    return `₹${Number(lakh.toFixed(0))} L`;
  }
  return formatPrice(price);
}

// Safely get [lat, lng] array from property object
function getCoords(property) {
  if (property.lat !== undefined && property.lng !== undefined) {
    return [Number(property.lat), Number(property.lng)];
  }
  if (property.location && Array.isArray(property.location.coordinates)) {
    // GeoJSON coordinates are [lng, lat]
    return [Number(property.location.coordinates[1]), Number(property.location.coordinates[0])];
  }
  return [19.076, 72.8777];
}

// Custom Leaflet DivIcon for price label marker
function createPriceIcon(price, isHovered, isSelected) {
  const formattedPrice = formatPriceCompact(price);
  return L.divIcon({
    className: 'custom-price-marker-wrapper',
    html: `<div class="map-price-badge ${isHovered ? 'is-hovered' : ''} ${isSelected ? 'is-selected' : ''}">
      <span>${formattedPrice}</span>
    </div>`,
    iconSize: [64, 32],
    iconAnchor: [32, 16],
    popupAnchor: [0, -20]
  });
}

// Auto fit map bounds based on active properties
function MapBoundsUpdater({ properties, hoveredId }) {
  const map = useMap();

  useEffect(() => {
    if (!properties || properties.length === 0) return;
    const points = properties.map(getCoords).filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));
    if (points.length > 0) {
      if (points.length === 1) {
        map.setView(points[0], 13);
      } else {
        const bounds = L.latLngBounds(points);
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [properties, map]);

  return null;
}

export default function ListingsMap({
  properties,
  hoveredPropertyId,
  selectedPropertyId,
  onSelectProperty,
  onHoverProperty
}) {
  const defaultCenter = properties.length > 0 ? getCoords(properties[0]) : [34.0522, -118.2437];

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', borderRadius: '16px', overflow: 'hidden' }}>
      <MapContainer
        center={defaultCenter}
        zoom={11}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapBoundsUpdater properties={properties} hoveredId={hoveredPropertyId} />

        {properties.map((property) => {
          const propId = property._id || property.id;
          const coords = getCoords(property);
          const isHovered = hoveredPropertyId === propId;
          const isSelected = selectedPropertyId === propId;
          const mainImage =
            (property.images && property.images[0]) ||
            'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80';

          return (
            <Marker
              key={propId}
              position={coords}
              icon={createPriceIcon(property.price, isHovered, isSelected)}
              eventHandlers={{
                click: () => onSelectProperty && onSelectProperty(propId),
                mouseover: () => onHoverProperty && onHoverProperty(propId),
                mouseout: () => onHoverProperty && onHoverProperty(null)
              }}
            >
              {/* Floating Preview Card on Marker Click */}
              <Popup closeButton={true} className="custom-map-popup">
                <div style={{ width: '220px', padding: '0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div
                    style={{
                      width: '100%',
                      height: '120px',
                      borderRadius: '8px 8px 0 0',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <img
                      src={mainImage}
                      alt={property.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: '6px',
                        left: '6px',
                        backgroundColor: 'rgba(18, 24, 36, 0.8)',
                        color: '#ffffff',
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '3px 6px',
                        borderRadius: '4px',
                        textTransform: 'uppercase'
                      }}
                    >
                      For {property.type === 'sale' ? 'Sale' : 'Rent'}
                    </div>
                  </div>

                  <div style={{ padding: '4px 10px 10px 10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
                      {formatPrice(property.price, property.type)}
                    </div>

                    <h4
                      style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        lineHeight: '1.2',
                        color: 'var(--text-dark)',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {property.title}
                    </h4>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <MapPin size={12} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {property.address?.city || 'Location'}, {property.address?.state || ''}
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: '11px',
                        color: 'var(--text)',
                        borderTop: '1px solid var(--border)',
                        paddingTop: '6px',
                        marginTop: '2px'
                      }}
                    >
                      <span>{property.bedrooms || 0} Beds</span>
                      <span>{property.bathrooms || 0} Baths</span>
                      <span>{property.areaSqft ? property.areaSqft.toLocaleString() : 0} sqft</span>
                    </div>

                    <Link
                      to={`/properties/${propId}`}
                      style={{
                        marginTop: '6px',
                        display: 'block',
                        textAlign: 'center',
                        backgroundColor: 'var(--primary)',
                        color: '#ffffff',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        textDecoration: 'none'
                      }}
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
