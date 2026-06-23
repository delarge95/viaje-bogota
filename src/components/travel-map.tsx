'use client';

import { useMemo } from 'react';
import {
  places,
  getPlaceById,
  resolvePlace,
  toGoogleMapsMode,
  type Place,
  type LatLng,
} from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Button } from '@/components/ui/button';
import { ExternalLink, Navigation, MapPin } from 'lucide-react';

interface TravelMapProps {
  highlightedPlaceIds?: string[];
  height?: string;
}

/**
 * Mapa interactivo usando Google Maps Embed (sin API key necesaria).
 * Muestra:
 * - Vista general de todos los lugares con marcadores (modo "place")
 * - Ruta real entre origen y destino cuando el usuario selecciona un segmento (modo "directions")
 *
 * El iframe de Google Maps Embed funciona sin API key usando el formato:
 * https://www.google.com/maps?saddr=...&daddr=...&dirflg=r (transit) | b (bicycling) | w (walking)
 * o con el parámetro output=embed para mostrar el mapa embebido.
 */
export default function TravelMap({
  highlightedPlaceIds = [],
  height = '500px',
}: TravelMapProps) {
  const selectedPlaceId = useTravelStore((s) => s.selectedPlaceId);
  const selectedAlternatives = useTravelStore((s) => s.selectedAlternatives);
  const routeOriginId = useTravelStore((s) => s.routeOriginId);
  const routeDestinationId = useTravelStore((s) => s.routeDestinationId);
  const routeMode = useTravelStore((s) => s.routeMode);
  const clearRoute = useTravelStore((s) => s.clearRoute);

  // Resolve origin and destination places (considering alternatives)
  const originPlace = useMemo(
    () => resolvePlace(routeOriginId, selectedAlternatives),
    [routeOriginId, selectedAlternatives]
  );
  const destinationPlace = useMemo(
    () => resolvePlace(routeDestinationId, selectedAlternatives),
    [routeDestinationId, selectedAlternatives]
  );

  // Build the Google Maps embed URL
  const mapEmbedUrl = useMemo(() => {
    // If we have a route, show directions
    if (originPlace && destinationPlace) {
      const origin = `${originPlace.coords[0]},${originPlace.coords[1]}`;
      const destination = `${destinationPlace.coords[0]},${destinationPlace.coords[1]}`;
      // dirflg: r = transit (TransMilenio/tren), w = walking, b = bicycling, d = driving (default)
      let dirflg = '';
      switch (routeMode) {
        case 'transit':
          dirflg = 'r';
          break;
        case 'walking':
          dirflg = 'w';
          break;
        case 'bicycling':
          dirflg = 'b';
          break;
        default:
          dirflg = 'd';
      }
      return `https://www.google.com/maps?saddr=${origin}&daddr=${destination}&dirflg=${dirflg}&output=embed&hl=es`;
    }

    // If a place is selected, center on it
    if (selectedPlaceId) {
      const place = resolvePlace(selectedPlaceId, selectedAlternatives);
      if (place) {
        const [lat, lng] = place.coords;
        return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=es`;
      }
    }

    // Default: show overview of all highlighted places or all places
    const idsToShow = highlightedPlaceIds.length > 0 ? highlightedPlaceIds : places.map((p) => p.id);
    const placesToShow = idsToShow
      .map((id) => resolvePlace(id, selectedAlternatives))
      .filter((p): p is Place => !!p);

    if (placesToShow.length === 0) {
      // Fallback: center on Bogotá
      return `https://www.google.com/maps?q=Bogotá,Colombia&z=12&output=embed&hl=es`;
    }

    // If only one place, center on it
    if (placesToShow.length === 1) {
      const [lat, lng] = placesToShow[0].coords;
      return `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed&hl=es`;
    }

    // Multiple places: use the first as center and create a bounding box via search
    // Google Maps embed doesn't support multiple markers without API key,
    // so we center between the extremes and show a search for the first place
    const lats = placesToShow.map((p) => p.coords[0]);
    const lngs = placesToShow.map((p) => p.coords[1]);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    // Calculate appropriate zoom based on spread
    const latSpread = Math.max(...lats) - Math.min(...lats);
    const lngSpread = Math.max(...lngs) - Math.min(...lngs);
    const maxSpread = Math.max(latSpread, lngSpread);
    let zoom = 12;
    if (maxSpread > 0.15) zoom = 10;
    else if (maxSpread > 0.08) zoom = 11;
    else if (maxSpread > 0.04) zoom = 12;
    else if (maxSpread > 0.02) zoom = 13;
    else zoom = 14;

    return `https://www.google.com/maps?q=${centerLat},${centerLng}&z=${zoom}&output=embed&hl=es`;
  }, [originPlace, destinationPlace, selectedPlaceId, highlightedPlaceIds, selectedAlternatives, routeMode]);

  // Build a link to open in Google Maps (new tab) with the same route
  const openInGoogleMapsUrl = useMemo(() => {
    if (originPlace && destinationPlace) {
      const origin = `${originPlace.coords[0]},${originPlace.coords[1]}`;
      const destination = `${destinationPlace.coords[0]},${destinationPlace.coords[1]}`;
      let mode = 'driving';
      switch (routeMode) {
        case 'transit':
          mode = 'transit';
          break;
        case 'walking':
          mode = 'walking';
          break;
        case 'bicycling':
          mode = 'bicycling';
          break;
      }
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mode}&hl=es`;
    }
    if (selectedPlaceId) {
      const place = resolvePlace(selectedPlaceId, selectedAlternatives);
      if (place) {
        return `https://www.google.com/maps/search/?api=1&query=${place.coords[0]},${place.coords[1]}&hl=es`;
      }
    }
    return 'https://www.google.com/maps/place/Bogotá/@4.6763,-74.0481,12z/data=!3m1!4b1!4m5!3m4!1s0x8e3f9bfd1da6cb15:0x68f5f4f7b9b5c9f5!8m2!3d4.711!4d-74.0721?hl=es';
  }, [originPlace, destinationPlace, selectedPlaceId, selectedAlternatives, routeMode]);

  // Determine display state
  const isRouteActive = !!(originPlace && destinationPlace);

  return (
    <div className="flex flex-col" style={{ height }}>
      {/* Map iframe */}
      <div className="flex-1 relative rounded-lg overflow-hidden border border-border bg-muted/40">
        <iframe
          key={mapEmbedUrl}
          src={mapEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0, minHeight: '100%' }}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
          title="Mapa Bogotá"
        />

        {/* Overlay info when route is active */}
        {isRouteActive && (
          <div className="absolute top-3 left-3 right-3 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Navigation className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-xs font-bold uppercase tracking-wide text-primary">
                    Ruta activa · {routeMode === 'transit' ? 'TransMilenio' : routeMode === 'walking' ? 'Caminata' : routeMode === 'bicycling' ? 'Bicicleta' : 'Carro/Uber/Taxi'}
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">{originPlace.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    <span className="font-medium text-foreground truncate">{destinationPlace.name}</span>
                  </div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs shrink-0"
                onClick={clearRoute}
              >
                ✕ Cerrar ruta
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Footer with link to open in Google Maps */}
      <div className="mt-2 flex items-center justify-between gap-2 px-1">
        <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
          <MapPin className="h-3 w-3" />
          {isRouteActive
            ? 'Ruta con direcciones reales (caminata, TM, carro)'
            : selectedPlaceId
            ? 'Lugar seleccionado'
            : `${highlightedPlaceIds.length || places.length} lugares en el itinerario`}
        </div>
        <Button variant="outline" size="sm" className="h-7 text-xs" asChild>
          <a href={openInGoogleMapsUrl} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-3 w-3 mr-1" />
            Abrir en Google Maps
          </a>
        </Button>
      </div>
    </div>
  );
}
