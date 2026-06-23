'use client';

import { useMemo } from 'react';
import { dayPlans, getPlaceById, resolvePlace, type TransportMode } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CalendarOff,
  AlertTriangle,
  Sparkles,
  Clock,
  MapPin,
  Navigation,
  Bus,
  Car,
  Footprints,
  Train,
  ArrowRight,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const transportIcons: Record<TransportMode, { icon: typeof Bus; label: string; color: string }> = {
  TM: { icon: Bus, label: 'TransMilenio', color: 'text-orange-600' },
  Tren: { icon: Train, label: 'Tren', color: 'text-blue-600' },
  Uber: { icon: Car, label: 'Uber', color: 'text-gray-700' },
  Cabify: { icon: Car, label: 'Cabify', color: 'text-gray-700' },
  Carro: { icon: Car, label: 'Carro', color: 'text-gray-700' },
  Taxi: { icon: Car, label: 'Taxi', color: 'text-gray-700' },
  Teleferico: { icon: Car, label: 'Teleférico', color: 'text-gray-700' },
  Caminata: { icon: Footprints, label: 'Caminata', color: 'text-green-700' },
  Espera: { icon: Clock, label: 'Espera', color: 'text-gray-500' },
  Interno: { icon: MapPin, label: 'Interno', color: 'text-gray-500' },
};

export default function DayItinerary() {
  const selectedDay = useTravelStore((s) => s.selectedDay);
  const selectedAlternatives = useTravelStore((s) => s.selectedAlternatives);
  const setSelectedPlaceId = useTravelStore((s) => s.setSelectedPlaceId);
  const setSelectedView = useTravelStore((s) => s.setSelectedView);
  const setSelectedStepId = useTravelStore((s) => s.setSelectedStepId);
  const selectedStepId = useTravelStore((s) => s.selectedStepId);
  const setRoute = useTravelStore((s) => s.setRoute);

  const dayPlan = useMemo(() => dayPlans.find((d) => d.day === selectedDay), [selectedDay]);

  const routePlaceIds = useMemo(() => {
    if (!dayPlan) return [];
    const ids: string[] = [];
    dayPlan.plan.forEach((item) => {
      const placeId = item.placeId || item.toPlaceId || item.fromPlaceId;
      if (placeId) {
        const place = getPlaceById(placeId);
        if (place?.restaurantCategory) {
          const altId = selectedAlternatives[place.restaurantCategory];
          if (altId) {
            ids.push(altId);
            return;
          }
        }
        ids.push(placeId);
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
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
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
            <div className="text-right shrink-0">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Costo 2 pers.</div>
              <div className="text-sm font-bold text-primary">{dayPlan.estimatedCost}</div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Timeline with clickable segments */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Itinerario paso a paso
          </CardTitle>
          <p className="text-[11px] text-muted-foreground mt-1">
            Clic en cualquier paso para ver la ruta en el mapa y los detalles del lugar
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-0">
            {dayPlan.plan.map((step, idx) => {
              const isActive = selectedStepId === step.id;
              const place = resolvePlace(step.placeId, selectedAlternatives);
              const fromPlace = resolvePlace(step.fromPlaceId, selectedAlternatives);
              const toPlace = resolvePlace(step.toPlaceId, selectedAlternatives);
              const isMovement = !!step.isMovement;
              const transport = step.transportMode ? transportIcons[step.transportMode] : null;
              const TransportIcon = transport?.icon || MapPin;

              const handleStepClick = () => {
                setSelectedStepId(step.id);

                if (isMovement && fromPlace && toPlace) {
                  // Set the route on the map
                  const mode = step.transportMode;
                  let gmapsMode: 'driving' | 'transit' | 'walking' | 'bicycling' = 'driving';
                  if (mode === 'TM' || mode === 'Tren') gmapsMode = 'transit';
                  else if (mode === 'Caminata') gmapsMode = 'walking';
                  setRoute(fromPlace.id, toPlace.id, gmapsMode);
                  setSelectedPlaceId(toPlace.id);
                } else if (place) {
                  setSelectedPlaceId(place.id);
                  useTravelStore.getState().clearRoute();
                }
                setSelectedView('mapa');
              };

              return (
                <div key={step.id} className="relative flex gap-3 pb-3 last:pb-0">
                  {/* Timeline line */}
                  {idx < dayPlan.plan.length - 1 && (
                    <div className={cn(
                      'absolute left-[11px] top-7 bottom-0 w-0.5',
                      isMovement ? 'bg-primary/30' : 'bg-border'
                    )} />
                  )}

                  {/* Step dot/icon */}
                  <button
                    onClick={handleStepClick}
                    className={cn(
                      'relative shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                      isActive
                        ? 'bg-primary border-primary text-primary-foreground scale-110 shadow-md'
                        : isMovement
                        ? 'bg-card border-primary/50 text-primary hover:border-primary'
                        : 'bg-card border-muted-foreground/40 text-muted-foreground hover:border-primary'
                    )}
                  >
                    {isMovement ? (
                      <TransportIcon className="h-3 w-3" />
                    ) : isActive ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : (
                      <Circle className="h-2.5 w-2.5 fill-current" />
                    )}
                  </button>

                  {/* Content */}
                  <button
                    onClick={handleStepClick}
                    className={cn(
                      'flex-1 min-w-0 text-left rounded-lg p-2.5 transition-all',
                      isActive
                        ? 'bg-primary/10 ring-1 ring-primary'
                        : 'hover:bg-muted/50'
                    )}
                  >
                    {/* Time + transport mode badge */}
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[11px] font-mono font-bold text-primary">
                        {step.time}
                      </span>
                      {transport && (
                        <Badge
                          variant="outline"
                          className={cn(
                            'text-[10px] py-0 h-4 gap-0.5',
                            transport.color,
                            'border-current/30'
                          )}
                        >
                          <TransportIcon className="h-2.5 w-2.5" />
                          {transport.label}
                          {step.transportDuration && ` · ${step.transportDuration}`}
                        </Badge>
                      )}
                    </div>

                    {/* Activity description */}
                    <div className={cn(
                      'text-sm text-foreground',
                      isMovement && 'font-medium'
                    )}>
                      {step.activity}
                    </div>

                    {/* Place name (resolved with alternative) */}
                    {place && (
                      <div className="flex items-center gap-1 mt-1 text-xs">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="font-medium text-foreground truncate">{place.name}</span>
                        {place.priceRange && (
                          <span className="text-[11px] text-primary font-medium ml-1">
                            · {place.priceRange.split(' por')[0]}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Movement: from → to */}
                    {isMovement && fromPlace && toPlace && (
                      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground truncate">{fromPlace.name}</span>
                        <ArrowRight className="h-3 w-3 shrink-0" />
                        <span className="font-medium text-foreground truncate">{toPlace.name}</span>
                        {step.transportCost && (
                          <span className="text-primary font-medium ml-1">· {step.transportCost}</span>
                        )}
                      </div>
                    )}

                    {/* Transport notes */}
                    {step.transportNotes && (
                      <div className="text-[11px] text-muted-foreground italic mt-1 leading-snug">
                        {step.transportNotes}
                      </div>
                    )}

                    {/* Step notes */}
                    {step.notes && !step.transportNotes && (
                      <div className="text-[11px] text-muted-foreground italic mt-1 leading-snug">
                        {step.notes}
                      </div>
                    )}

                    {/* Active indicator */}
                    {isActive && (
                      <div className="flex items-center gap-1 mt-1.5 text-[10px] text-primary font-semibold">
                        <Navigation className="h-2.5 w-2.5" />
                        Mostrando ruta en el mapa →
                      </div>
                    )}
                  </button>
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
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Pasos</div>
            <div className="text-lg font-bold text-foreground">{dayPlan.plan.length}</div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Trayectos</div>
            <div className="text-lg font-bold text-foreground">
              {dayPlan.plan.filter((s) => s.isMovement).length}
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
