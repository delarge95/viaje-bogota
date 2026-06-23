'use client';

import { useMemo } from 'react';
import {
  places,
  resolvePlace,
  type Place,
} from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Button } from '@/components/ui/button';
import { ExternalLink, Navigation, MapPin, X } from 'lucide-react';

interface TravelMapProps {
  highlightedPlaceIds?: string[];
  height?: string;
  compact?: boolean;
  overrideSelectedPlaceId?: string;
}

export default function TravelMap({
  highlightedPlaceIds = [],
  height = '100%',
  compact = false,
  overrideSelectedPlaceId,
}: TravelMapProps) {
  const selectedPlaceId = useTravelStore((s) => s.selectedPlaceId);
  const selectedAlternatives = useTravelStore((s) => s.selectedAlternatives);
  const routeOriginId = useTravelStore((s) => s.routeOriginId);
  const routeDestinationId = useTravelStore((s) => s.routeDestinationId);
  const routeMode = useTravelStore((s) => s.routeMode);
  const clearRoute = useTravelStore((s) => s.clearRoute);
  const clearStepSelection = useTravelStore((s) => s.clearStepSelection);

  // Use override if provided (for step-based map centering without setting selectedPlaceId)
  const effectivePlaceId = overrideSelectedPlaceId || selectedPlaceId;

  const originPlace = useMemo(
    () => resolvePlace(routeOriginId, selectedAlternatives),
    [routeOriginId, selectedAlternatives]
  );
  const destinationPlace = useMemo(
    () => resolvePlace(routeDestinationId, selectedAlternatives),
    [routeDestinationId, selectedAlternatives]
  );

  const mapEmbedUrl = useMemo(() => {
    if (originPlace && destinationPlace) {
      const origin = `${originPlace.coords[0]},${originPlace.coords[1]}`;
      const destination = `${destinationPlace.coords[0]},${destinationPlace.coords[1]}`;
      let dirflg = 'd';
      if (routeMode === 'transit') dirflg = 'r';
      else if (routeMode === 'walking') dirflg = 'w';
      else if (routeMode === 'bicycling') dirflg = 'b';
      return `https://www.google.com/maps?saddr=${origin}&daddr=${destination}&dirflg=${dirflg}&output=embed&hl=es`;
    }
    if (effectivePlaceId) {
      const place = resolvePlace(effectivePlaceId, selectedAlternatives);
      if (place) {
        return `https://www.google.com/maps?q=${place.coords[0]},${place.coords[1]}&z=15&output=embed&hl=es`;
      }
    }
    const idsToShow = highlightedPlaceIds.length > 0 ? highlightedPlaceIds : places.map((p) => p.id);
    const placesToShow = idsToShow
      .map((id) => resolvePlace(id, selectedAlternatives))
      .filter((p): p is Place => !!p);
    if (placesToShow.length === 0) {
      return `https://www.google.com/maps?q=Bogotá,Colombia&z=12&output=embed&hl=es`;
    }
    if (placesToShow.length === 1) {
      return `https://www.google.com/maps?q=${placesToShow[0].coords[0]},${placesToShow[0].coords[1]}&z=15&output=embed&hl=es`;
    }
    const lats = placesToShow.map((p) => p.coords[0]);
    const lngs = placesToShow.map((p) => p.coords[1]);
    const centerLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centerLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;
    const maxSpread = Math.max(Math.max(...lats) - Math.min(...lats), Math.max(...lngs) - Math.min(...lngs));
    let zoom = 12;
    if (maxSpread > 0.15) zoom = 10;
    else if (maxSpread > 0.08) zoom = 11;
    else if (maxSpread > 0.04) zoom = 12;
    else if (maxSpread > 0.02) zoom = 13;
    else zoom = 14;
    return `https://www.google.com/maps?q=${centerLat},${centerLng}&z=${zoom}&output=embed&hl=es`;
  }, [originPlace, destinationPlace, effectivePlaceId, highlightedPlaceIds, selectedAlternatives, routeMode]);

  const openInGoogleMapsUrl = useMemo(() => {
    if (originPlace && destinationPlace) {
      const origin = `${originPlace.coords[0]},${originPlace.coords[1]}`;
      const destination = `${destinationPlace.coords[0]},${destinationPlace.coords[1]}`;
      return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${routeMode}&hl=es`;
    }
    if (effectivePlaceId) {
      const place = resolvePlace(effectivePlaceId, selectedAlternatives);
      if (place) return `https://www.google.com/maps/search/?api=1&query=${place.coords[0]},${place.coords[1]}&hl=es`;
    }
    return 'https://www.google.com/maps/place/Bogotá/@4.6763,-74.0481,12z?hl=es';
  }, [originPlace, destinationPlace, effectivePlaceId, selectedAlternatives, routeMode]);

  const isRouteActive = !!(originPlace && destinationPlace);
  const modeLabel = routeMode === 'transit' ? 'TransMilenio' : routeMode === 'walking' ? 'Caminata' : routeMode === 'bicycling' ? 'Bicicleta' : 'Carro/Uber';

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 relative rounded-xl overflow-hidden border border-border bg-muted/30">
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

        {isRouteActive && !compact && (
          <div className="absolute top-3 left-3 right-3 bg-card/95 backdrop-blur-sm border border-border rounded-lg p-2.5 shadow-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <Navigation className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
                    {modeLabel}
                  </span>
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="font-medium truncate">{originPlace?.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                    <span className="font-medium truncate">{destinationPlace?.name}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => { clearRoute(); clearStepSelection(); }}
                className="shrink-0 p-1 hover:bg-muted rounded-md transition-colors"
                aria-label="Cerrar ruta"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {!compact && (
        <div className="mt-2 flex items-center justify-between gap-2 px-1">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {isRouteActive ? 'Ruta con direcciones reales' : effectivePlaceId ? 'Ubicación seleccionada' : `${highlightedPlaceIds.length || places.length} lugares`}
          </div>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] gap-1" asChild>
            <a href={openInGoogleMapsUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
              Google Maps
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
