'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { places, getPlaceById, type Place, type LatLng } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const categoryConfig: Record<string, { color: string; symbol: string; label: string }> = {
  alojamiento: { color: '#C2410C', symbol: '⌂', label: 'Alojamiento' },
  cultura: { color: '#C2410C', symbol: '◆', label: 'Cultura' },
  naturaleza: { color: '#166534', symbol: '▲', label: 'Naturaleza' },
  restaurante: { color: '#B45309', symbol: '●', label: 'Restaurante' },
  mercado: { color: '#B45309', symbol: '◆', label: 'Mercado' },
  transporte: { color: '#6B7280', symbol: '■', label: 'Transporte' },
  compras: { color: '#C2410C', symbol: '●', label: 'Compras' },
};

function createCustomIcon(place: Place, isActive: boolean, isAlternative: boolean) {
  const config = categoryConfig[place.category] || categoryConfig.restaurante;
  const size = isActive ? 36 : 28;
  const opacity = isAlternative ? 0.65 : 1;
  const border = isAlternative ? 'dashed' : 'solid';

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        border-radius: 50% 50% 50% 0;
        background: ${config.color};
        transform: rotate(-45deg);
        border: 2px ${border} white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.25);
        opacity: ${opacity};
        display: flex;
        align-items: center;
        justify-content: center;
        ${isActive ? 'z-index: 1000; transform: rotate(-45deg) scale(1.15);' : ''}
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: ${size * 0.45}px;
          font-weight: bold;
          line-height: 1;
        ">${config.symbol}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
}

function MapBoundsFitter({ placesToFit }: { placesToFit: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (placesToFit.length === 0) return;
    if (placesToFit.length === 1) {
      map.setView(placesToFit[0], 14, { animate: true });
    } else {
      const bounds = L.latLngBounds(placesToFit);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14, animate: true });
    }
  }, [placesToFit, map]);
  return null;
}

interface TravelMapProps {
  highlightedPlaceIds?: string[];
  routePlaceIds?: string[];
  showAll?: boolean;
  height?: string;
}

export default function TravelMap({
  highlightedPlaceIds = [],
  routePlaceIds = [],
  showAll = false,
  height = '500px',
}: TravelMapProps) {
  const selectedPlaceId = useTravelStore((s) => s.selectedPlaceId);
  const setSelectedPlaceId = useTravelStore((s) => s.setSelectedPlaceId);

  // Determine which places to show
  const visiblePlaces = useMemo(() => {
    if (showAll) return places;
    const idsToShow = new Set<string>([...highlightedPlaceIds, ...routePlaceIds, 'alojamiento']);
    return places.filter((p) => idsToShow.has(p.id));
  }, [showAll, highlightedPlaceIds, routePlaceIds]);

  // Build route polyline from routePlaceIds
  const routePoints: LatLng[] = useMemo(() => {
    return routePlaceIds
      .map((id) => getPlaceById(id))
      .filter((p): p is Place => !!p)
      .map((p) => p.coords);
  }, [routePlaceIds]);

  // Places to fit in view
  const placesToFit = useMemo(() => {
    if (visiblePlaces.length === 0) return [[4.6760, -74.0520] as LatLng]; // default Calle 94
    return visiblePlaces.map((p) => p.coords);
  }, [visiblePlaces]);

  return (
    <div style={{ height, width: '100%' }} className="rounded-lg overflow-hidden border border-border">
      <MapContainer
        center={[4.6760, -74.0520]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapBoundsFitter placesToFit={placesToFit} />

        {/* Route polyline */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              color: '#C2410C',
              weight: 3,
              opacity: 0.85,
              dashArray: '8, 6',
            }}
          />
        )}

        {/* Markers */}
        {visiblePlaces.map((place) => {
          const isActive = place.id === selectedPlaceId;
          const isAlternative = !!place.isAlternative;
          return (
            <Marker
              key={place.id}
              position={place.coords}
              icon={createCustomIcon(place, isActive, isAlternative)}
              eventHandlers={{
                click: () => setSelectedPlaceId(place.id),
              }}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <div className="font-semibold text-foreground text-sm mb-1">{place.name}</div>
                  <div className="text-xs text-muted-foreground mb-1.5">{place.address}</div>
                  {place.priceRange && (
                    <div className="text-xs font-medium text-primary mb-1">{place.priceRange}</div>
                  )}
                  {place.hours && (
                    <div className="text-xs text-muted-foreground mb-1.5">
                      <span className="font-medium">Horario:</span> {place.hours}
                    </div>
                  )}
                  {place.rating && place.rating.score > 0 && (
                    <div className="text-xs mb-1.5">
                      <span className="font-medium">⭐ {place.rating.score}/5</span>
                      <span className="text-muted-foreground"> ({place.rating.reviews} reseñas · {place.rating.source})</span>
                      {place.meetsCriteria && (
                        <span className="ml-1 text-green-700 text-xs font-medium">✓ cumple criterio</span>
                      )}
                    </div>
                  )}
                  {place.web && (
                    <a
                      href={place.web}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline"
                    >
                      Ver sitio web →
                    </a>
                  )}
                  {place.googleMapsUrl && (
                    <div>
                      <a
                        href={place.googleMapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline"
                      >
                        Abrir en Google Maps →
                      </a>
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
