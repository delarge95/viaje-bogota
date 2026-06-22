'use client';

import { useMemo } from 'react';
import { dayPlans, getPlaceById, places } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  MapPin,
  AlertTriangle,
  CalendarOff,
  Sparkles,
} from 'lucide-react';

export default function DayItinerary() {
  const selectedDay = useTravelStore((s) => s.selectedDay);
  const selectedAlternatives = useTravelStore((s) => s.selectedAlternatives);
  const setSelectedPlaceId = useTravelStore((s) => s.setSelectedPlaceId);
  const setSelectedView = useTravelStore((s) => s.setSelectedView);

  const dayPlan = useMemo(() => dayPlans.find((d) => d.day === selectedDay), [selectedDay]);

  // Build the list of place IDs to highlight on the map for this day
  // Including alternatives selected by user
  const routePlaceIds = useMemo(() => {
    if (!dayPlan) return [];
    const ids: string[] = [];
    dayPlan.plan.forEach((item) => {
      if (item.placeId) {
        const place = getPlaceById(item.placeId);
        // If this is a restaurant with a category, check if user selected an alternative
        if (place?.restaurantCategory) {
          const altId = selectedAlternatives[place.restaurantCategory];
          if (altId) {
            ids.push(altId);
            return;
          }
        }
        ids.push(item.placeId);
      }
    });
    return ids;
  }, [dayPlan, selectedAlternatives]);

  if (!dayPlan) return null;

  return (
    <div className="space-y-4">
      {/* Day header */}
      <Card className={cn('overflow-hidden', dayPlan.isFeriado && 'border-amber-400')}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="secondary" className="text-xs">
                  Día {dayPlan.day} · {dayPlan.weekday} {dayPlan.date}
                </Badge>
                {dayPlan.isFeriado && (
                  <Badge variant="outline" className="text-xs text-amber-700 border-amber-400 bg-amber-50">
                    <CalendarOff className="h-3 w-3 mr-1" /> Feriado
                  </Badge>
                )}
                {dayPlan.isRestriccionMedica && (
                  <Badge variant="outline" className="text-xs text-red-700 border-red-300 bg-red-50">
                    <AlertTriangle className="h-3 w-3 mr-1" /> Pupilas dilatadas
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg leading-tight">{dayPlan.title}</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">{dayPlan.subtitle}</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Costo 2 pers.</div>
              <div className="text-sm font-bold text-primary">{dayPlan.estimatedCost}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Itinerario paso a paso
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-0">
            {dayPlan.plan.map((item, idx) => {
              // Resolve place: if restaurant with category, check for alternative
              let place = item.placeId ? getPlaceById(item.placeId) : undefined;
              if (place?.restaurantCategory) {
                const altId = selectedAlternatives[place.restaurantCategory];
                if (altId) {
                  place = getPlaceById(altId);
                }
              }

              return (
                <div key={idx} className="relative flex gap-3 pb-4 last:pb-0">
                  {/* Timeline line */}
                  {idx < dayPlan.plan.length - 1 && (
                    <div className="absolute left-[7px] top-5 bottom-0 w-px bg-border" />
                  )}

                  {/* Time dot */}
                  <div className="relative shrink-0">
                    <div
                      className={cn(
                        'w-3.5 h-3.5 rounded-full border-2 mt-1',
                        place
                          ? 'bg-primary border-primary'
                          : 'bg-background border-muted-foreground/40'
                      )}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-mono font-semibold text-primary mb-0.5">
                      {item.time}
                    </div>
                    {place ? (
                      <button
                        onClick={() => {
                          setSelectedPlaceId(place!.id);
                          setSelectedView('mapa');
                        }}
                        className="text-left group w-full"
                      >
                        <div className="font-medium text-sm text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-primary" />
                          {place.name}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5">{item.activity}</div>
                        {place.priceRange && (
                          <div className="text-[11px] text-primary font-medium mt-0.5">{place.priceRange}</div>
                        )}
                      </button>
                    ) : (
                      <div>
                        <div className="text-sm text-foreground">{item.activity}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Alternatives for this day */}
      {dayPlan.alternatives && dayPlan.alternatives.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Planes alternativos para este día
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {dayPlan.alternatives.map((alt, idx) => (
              <div key={idx} className="border border-border rounded-md p-3 bg-muted/30">
                <div className="text-xs font-semibold text-foreground mb-1">{alt.label}</div>
                <div className="text-xs text-muted-foreground mb-2">{alt.description}</div>
                <div className="flex flex-wrap gap-1">
                  {alt.placeIds.map((pid) => {
                    const p = getPlaceById(pid);
                    if (!p) return null;
                    return (
                      <Button
                        key={pid}
                        variant="outline"
                        size="sm"
                        className="h-6 text-[11px] py-0"
                        onClick={() => {
                          setSelectedPlaceId(pid);
                          setSelectedView('mapa');
                        }}
                      >
                        {p.name}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Quick stats */}
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Paradas</div>
            <div className="text-lg font-bold text-foreground">{routePlaceIds.length}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Lugares</div>
            <div className="text-lg font-bold text-foreground">
              {routePlaceIds.filter((id, i, arr) => arr.indexOf(id) === i).length}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Costo</div>
            <div className="text-sm font-bold text-primary leading-tight pt-1">{dayPlan.estimatedCost}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
