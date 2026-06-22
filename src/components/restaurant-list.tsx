'use client';

import { useMemo } from 'react';
import { places, categoryLabels, categoryEmojis, type RestaurantCategory } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function RestaurantList() {
  const setSelectedPlaceId = useTravelStore((s) => s.setSelectedPlaceId);
  const setSelectedView = useTravelStore((s) => s.setSelectedView);

  // Group restaurants by category
  const grouped = useMemo(() => {
    const groups: Record<string, typeof places> = {};
    places
      .filter((p) => p.category === 'restaurante' || p.category === 'mercado')
      .forEach((p) => {
        const key = p.restaurantCategory || 'otros';
        if (!groups[key]) groups[key] = [];
        groups[key].push(p);
      });
    return groups;
  }, []);

  const categoryOrder: RestaurantCategory[] = ['aleman', 'taqueria', 'lechona', 'chiguiro', 'tipica', 'italiana', 'mercado'];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold mb-1">Todos los restaurantes y alternativas</h2>
        <p className="text-xs text-muted-foreground">
          {places.filter((p) => p.category === 'restaurante' || p.category === 'mercado').length} lugares · 7 categorías ·
          Clic en cualquier lugar para ver menú, horarios y contacto
        </p>
      </div>

      {categoryOrder.map((cat) => {
        const items = grouped[cat];
        if (!items || items.length === 0) return null;
        const main = items.find((p) => !p.isAlternative);
        const alts = items.filter((p) => p.isAlternative);

        return (
          <div key={cat} className="space-y-2">
            <div className="flex items-center gap-2 pb-1 border-b border-border">
              <span className="text-lg">{categoryEmojis[cat]}</span>
              <h3 className="text-sm font-semibold">{categoryLabels[cat]}</h3>
              <Badge variant="secondary" className="text-[10px] ml-auto">
                {items.length} opciones
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {main && (
                <RestaurantCard
                  place={main}
                  isMain
                  onClick={() => {
                    setSelectedPlaceId(main.id);
                    setSelectedView('mapa');
                  }}
                />
              )}
              {alts.map((alt) => (
                <RestaurantCard
                  key={alt.id}
                  place={alt}
                  onClick={() => {
                    setSelectedPlaceId(alt.id);
                    setSelectedView('mapa');
                  }}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RestaurantCard({
  place,
  isMain,
  onClick,
}: {
  place: (typeof places)[number];
  isMain?: boolean;
  onClick: () => void;
}) {
  return (
    <Card
      className={cn(
        'cursor-pointer hover:border-primary/60 hover:shadow-md transition-all overflow-hidden',
        isMain && 'ring-1 ring-primary/30'
      )}
      onClick={onClick}
    >
      <CardContent className="p-3">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-medium text-sm text-foreground truncate">{place.name}</span>
              {isMain && (
                <Badge variant="outline" className="text-[10px] py-0 h-4">
                  Principal
                </Badge>
              )}
              {place.meetsCriteria && (
                <span className="inline-flex items-center gap-0.5 text-[10px] text-green-700 font-medium bg-green-50 px-1 py-0.5 rounded">
                  <Check className="h-2.5 w-2.5" /> &gt;1k · ≥4/5
                </span>
              )}
            </div>
            <div className="text-[11px] text-muted-foreground truncate mt-0.5">{place.address}</div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
          {place.rating && place.rating.score > 0 ? (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-amber-600 fill-amber-500" />
              <span className="font-semibold">{place.rating.score}</span>
              <span className="text-muted-foreground">({place.rating.reviews})</span>
            </div>
          ) : (
            <span className="text-muted-foreground text-[10px] italic">Sin calificación verificada</span>
          )}
          {place.priceRange && (
            <span className="text-primary font-medium truncate">{place.priceRange.split(' por')[0]}</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
