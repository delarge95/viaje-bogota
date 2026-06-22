'use client';

import { useMemo } from 'react';
import {
  places,
  dayPlans,
  getPlaceById,
  categoryLabels,
  categoryEmojis,
  type RestaurantCategory,
} from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Star, Check, AlertCircle } from 'lucide-react';

export default function AlternativesSelector() {
  const selectedDay = useTravelStore((s) => s.selectedDay);
  const selectedAlternatives = useTravelStore((s) => s.selectedAlternatives);
  const setSelectedAlternative = useTravelStore((s) => s.setSelectedAlternative);
  const setSelectedPlaceId = useTravelStore((s) => s.setSelectedPlaceId);

  const dayPlan = useMemo(() => dayPlans.find((d) => d.day === selectedDay), [selectedDay]);

  // Find restaurant categories involved in this day's plan
  const dayCategories = useMemo(() => {
    if (!dayPlan) return new Set<RestaurantCategory>();
    const cats = new Set<RestaurantCategory>();
    dayPlan.plan.forEach((item) => {
      if (item.placeId) {
        const place = getPlaceById(item.placeId);
        if (place?.restaurantCategory) {
          cats.add(place.restaurantCategory);
        }
      }
    });
    dayPlan.alternatives?.forEach((alt) => {
      alt.placeIds.forEach((pid) => {
        const place = getPlaceById(pid);
        if (place?.restaurantCategory) {
          cats.add(place.restaurantCategory);
        }
      });
    });
    return cats;
  }, [dayPlan]);

  if (dayCategories.size === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6 text-center text-sm text-muted-foreground">
          Este día no tiene restaurantes con alternativas disponibles.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="text-base font-semibold">Alternativas para el día {selectedDay}</h3>
        <Badge variant="outline" className="text-xs">
          {dayCategories.size} categorías
        </Badge>
      </div>
      <p className="text-xs text-muted-foreground -mt-2">
        Selecciona una alternativa para actualizar el mapa y la ruta. Las marcas ✓ cumplen el criterio de &gt;1k reseñas Google y ≥4/5.
      </p>

      {Array.from(dayCategories).map((category) => {
        const allOptions = places.filter((p) => p.restaurantCategory === category);
        const main = allOptions.find((p) => !p.isAlternative);
        const alternatives = allOptions.filter((p) => p.isAlternative);
        const selectedId = selectedAlternatives[category] || main?.id;

        return (
          <Card key={category} className="overflow-hidden">
            <CardHeader className="pb-2 bg-muted/30">
              <CardTitle className="text-sm flex items-center gap-2">
                <span className="text-base">{categoryEmojis[category]}</span>
                <span>{categoryLabels[category]}</span>
                <Badge variant="secondary" className="text-[10px] ml-auto">
                  {allOptions.length} opciones
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-1.5">
              {/* Main option */}
              {main && (
                <OptionRow
                  place={main}
                  isSelected={selectedId === main.id}
                  onSelect={() => {
                    setSelectedAlternative(category, main.id);
                    setSelectedPlaceId(main.id);
                  }}
                  isMain
                />
              )}
              {/* Alternatives */}
              {alternatives.map((alt) => (
                <OptionRow
                  key={alt.id}
                  place={alt}
                  isSelected={selectedId === alt.id}
                  onSelect={() => {
                    setSelectedAlternative(category, alt.id);
                    setSelectedPlaceId(alt.id);
                  }}
                />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

interface OptionRowProps {
  place: (typeof places)[number];
  isSelected: boolean;
  onSelect: () => void;
  isMain?: boolean;
}

function OptionRow({ place, isSelected, onSelect, isMain }: OptionRowProps) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-2.5 rounded-md border transition-all ${
        isSelected
          ? 'border-primary bg-primary/10 ring-1 ring-primary'
          : 'border-border hover:border-primary/50 hover:bg-muted/50'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="font-medium text-sm text-foreground truncate">{place.name}</span>
            {isMain && (
              <Badge variant="outline" className="text-[10px] py-0 h-4">
                Principal
              </Badge>
            )}
            {place.meetsCriteria && (
              <span className="inline-flex items-center gap-0.5 text-[10px] text-green-700 font-medium">
                <Check className="h-3 w-3" /> criterio
              </span>
            )}
          </div>
          <div className="text-[11px] text-muted-foreground truncate mt-0.5">{place.address}</div>
          {place.rating && place.rating.score > 0 && (
            <div className="flex items-center gap-1 text-[11px] mt-0.5">
              <Star className="h-3 w-3 text-amber-600 fill-amber-500" />
              <span className="font-medium">{place.rating.score}</span>
              <span className="text-muted-foreground">({place.rating.reviews})</span>
            </div>
          )}
          {!place.meetsCriteria && place.rating && place.rating.score > 0 && place.rating.score < 4 && (
            <div className="flex items-center gap-1 text-[10px] text-amber-700 mt-0.5">
              <AlertCircle className="h-2.5 w-2.5" />
              <span>Calificación &lt;4</span>
            </div>
          )}
          {place.priceRange && (
            <div className="text-[11px] text-primary font-medium mt-0.5">{place.priceRange}</div>
          )}
        </div>
      </div>
    </button>
  );
}
