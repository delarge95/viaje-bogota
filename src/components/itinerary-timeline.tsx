'use client';

import { useMemo } from 'react';
import { dayPlans, getPlaceById, resolvePlace, toGoogleMapsMode, type TransportMode, type StepType, type PlanStep } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  CalendarOff,
  AlertTriangle,
  Bus,
  Car,
  Footprints,
  Train,
  ArrowRight,
  MapPin,
  Utensils,
  ShoppingBag,
  Clock,
  Info,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const stepTypeConfig: Record<StepType, { icon: typeof Bus; color: string; bg: string; label: string }> = {
  movilidad: { icon: Car, color: 'text-orange-600', bg: 'bg-orange-50 border-orange-200', label: 'Trayecto' },
  actividad: { icon: MapPin, color: 'text-rose-600', bg: 'bg-rose-50 border-rose-200', label: 'Actividad' },
  comida: { icon: Utensils, color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Comida' },
  compra: { icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-50 border-violet-200', label: 'Compra' },
  espera: { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200', label: 'Espera' },
  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50 border-blue-200', label: 'Info' },
};

const transportIcons: Record<TransportMode, typeof Bus> = {
  TM: Bus,
  SITP: Bus,
  Tren: Train,
  Uber: Car,
  Cabify: Car,
  Carro: Car,
  Taxi: Car,
  Teleferico: Car,
  Caminata: Footprints,
  Espera: Clock,
  Interno: MapPin,
};

interface ItineraryTimelineProps {
  steps?: PlanStep[]; // override (for custom plans)
  dayTitle?: string;
  daySubtitle?: string;
  isFeriado?: boolean;
  isRestriccionMedica?: boolean;
  estimatedCost?: string;
}

export default function ItineraryTimeline({
  steps: overrideSteps,
  dayTitle,
  daySubtitle,
  isFeriado,
  isRestriccionMedica,
  estimatedCost,
}: ItineraryTimelineProps) {
  const selectedDay = useTravelStore((s) => s.selectedDay);
  const selectedAlternatives = useTravelStore((s) => s.selectedAlternatives);
  const selectedTransport = useTravelStore((s) => s.selectedTransport);
  const setSelectedPlaceId = useTravelStore((s) => s.setSelectedPlaceId);
  const selectStep = useTravelStore((s) => s.selectStep);
  const selectedStepId = useTravelStore((s) => s.selectedStepId);
  const stepClickCount = useTravelStore((s) => s.stepClickCount);
  const setRoute = useTravelStore((s) => s.setRoute);
  const clearRoute = useTravelStore((s) => s.clearRoute);

  const dayPlan = useMemo(() => dayPlans.find((d) => d.day === selectedDay), [selectedDay]);

  const steps = overrideSteps || dayPlan?.plan || [];
  const title = dayTitle || dayPlan?.title || '';
  const subtitle = daySubtitle || dayPlan?.subtitle || '';
  const showFeriado = isFeriado ?? dayPlan?.isFeriado;
  const showMedica = isRestriccionMedica ?? dayPlan?.isRestriccionMedica;
  const cost = estimatedCost || dayPlan?.estimatedCost || '';

  const handleStepClick = (step: PlanStep) => {
    const state = useTravelStore.getState();
    const isSameStep = state.selectedStepId === step.id;
    const newClickCount = isSameStep ? state.stepClickCount + 1 : 1;

    // Call selectStep to update store
    selectStep(step.id);

    if (step.isMovement && step.fromPlaceId && step.toPlaceId) {
      // Determine which transport alternative is selected
      let mode = step.transportMode;
      if (step.transportAlternatives && step.transportAlternatives.length > 0) {
        const selectedAltId = state.selectedTransport[step.id];
        const selectedAlt = step.transportAlternatives.find((a) => a.id === selectedAltId)
          || step.transportAlternatives.find((a) => a.isRecommended)
          || step.transportAlternatives[0];
        if (selectedAlt) mode = selectedAlt.mode;
      }
      const gmapsMode = toGoogleMapsMode(mode);
      setRoute(step.fromPlaceId, step.toPlaceId, gmapsMode);

      // On second click (newClickCount >= 2), show place detail
      if (newClickCount >= 2) {
        const destPlace = resolvePlace(step.toPlaceId, state.selectedAlternatives);
        if (destPlace) setSelectedPlaceId(destPlace.id);
      } else {
        setSelectedPlaceId(null);
      }
    } else if (step.placeId) {
      const place = resolvePlace(step.placeId, state.selectedAlternatives);
      if (place) {
        clearRoute();
        // First click: show location on map only (no detail panel). 
        // Second click: show detail panel.
        if (newClickCount >= 2) {
          setSelectedPlaceId(place.id);
        } else {
          // First click: clear selectedPlaceId so detail panel doesn't show,
          // but the map will still center on the place via selectedStepId
          setSelectedPlaceId(null);
        }
      }
    }
  };

  return (
    <div className="space-y-3">
      {/* Day header - compact */}
      <div className="flex items-start justify-between gap-3 pb-2 border-b border-border">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
              Día {selectedDay}
            </span>
            {showFeriado && (
              <Badge variant="outline" className="text-[9px] py-0 h-4 text-amber-700 border-amber-400 bg-amber-50">
                <CalendarOff className="h-2.5 w-2.5 mr-0.5" /> Feriado
              </Badge>
            )}
            {showMedica && (
              <Badge variant="outline" className="text-[9px] py-0 h-4 text-red-700 border-red-300 bg-red-50">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Pupilas dilatadas
              </Badge>
            )}
          </div>
          <h2 className="text-base font-bold leading-tight">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        {cost && (
          <div className="text-right shrink-0">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">2 pers.</div>
            <div className="text-xs font-bold text-primary">{cost}</div>
          </div>
        )}
      </div>

      {/* Steps */}
      <div className="space-y-1">
        {steps.map((step, idx) => {
          const isActive = selectedStepId === step.id;
          const showDetail = isActive && stepClickCount >= 2;
          const config = stepTypeConfig[step.type];
          const StepIcon = config.icon;
          const place = resolvePlace(step.placeId, selectedAlternatives);
          const fromPlace = resolvePlace(step.fromPlaceId, selectedAlternatives);
          const toPlace = resolvePlace(step.toPlaceId, selectedAlternatives);

          // Determine effective transport
          let effectiveMode = step.transportMode;
          if (step.transportAlternatives && step.transportAlternatives.length > 0) {
            const sel = selectedTransport[step.id];
            const alt = step.transportAlternatives.find((a) => a.id === sel)
              || step.transportAlternatives.find((a) => a.isRecommended)
              || step.transportAlternatives[0];
            if (alt) effectiveMode = alt.mode;
          }
          const TransportIcon = effectiveMode ? transportIcons[effectiveMode] : null;

          return (
            <div key={step.id} className="relative">
              {/* Timeline connector */}
              {idx < steps.length - 1 && (
                <div className={cn(
                  'absolute left-[15px] top-8 bottom-[-4px] w-px',
                  step.isMovement ? 'bg-orange-200' : 'bg-border'
                )} />
              )}

              <div
                onClick={() => handleStepClick(step)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStepClick(step); } }}
                className={cn(
                  'group relative w-full text-left rounded-xl border transition-all p-3 pl-10 cursor-pointer',
                  isActive
                    ? cn(config.bg, 'border-primary/40 shadow-sm ring-1 ring-primary/20')
                    : 'border-border hover:border-primary/30 hover:bg-muted/30'
                )}
              >
                {/* Step icon */}
                <div className={cn(
                  'absolute left-2 top-3 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-transform',
                  isActive ? cn('bg-primary border-primary text-primary-foreground scale-110') : cn('bg-card border-border', config.color)
                )}>
                  {step.isMovement && TransportIcon ? (
                    <TransportIcon className="h-3 w-3" />
                  ) : (
                    <StepIcon className="h-3 w-3" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0">
                  {/* Time + type badge */}
                  <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-primary">{step.time}</span>
                    <span className={cn('text-[9px] uppercase tracking-wide font-semibold', config.color)}>
                      {config.label}
                    </span>
                    {step.isMovement && effectiveMode && (
                      <span className={cn('text-[9px] font-medium', config.color)}>
                        · {effectiveMode === 'TM' ? 'TransMilenio' : effectiveMode}
                      </span>
                    )}
                    {showDetail && (
                      <ChevronRight className="h-3 w-3 text-primary ml-auto" />
                    )}
                  </div>

                  {/* Activity */}
                  <div className={cn(
                    'text-xs leading-snug',
                    step.isMovement ? 'font-medium' : 'text-foreground'
                  )}>
                    {step.activity}
                  </div>

                  {/* Place name */}
                  {place && (
                    <div className="flex items-center gap-1 mt-0.5 text-[11px]">
                      <MapPin className="h-2.5 w-2.5 text-primary shrink-0" />
                      <span className="font-medium truncate">{place.name}</span>
                    </div>
                  )}

                  {/* Movement: from → to */}
                  {step.isMovement && fromPlace && toPlace && (
                    <div className="flex items-center gap-1 mt-0.5 text-[11px] text-muted-foreground">
                      <span className="font-medium text-foreground truncate">{fromPlace.name}</span>
                      <ArrowRight className="h-2.5 w-2.5 shrink-0" />
                      <span className="font-medium text-foreground truncate">{toPlace.name}</span>
                    </div>
                  )}

                  {/* Transport alternatives selector (if multiple) */}
                  {step.isMovement && step.transportAlternatives && step.transportAlternatives.length > 1 && (
                    <div className="mt-1.5 flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                      {step.transportAlternatives.map((alt) => {
                        const sel = selectedTransport[step.id];
                        const isSelected = sel ? sel === alt.id : alt.isRecommended;
                        const AltIcon = transportIcons[alt.mode];
                        return (
                          <button
                            key={alt.id}
                            onClick={() => {
                              useTravelStore.getState().setSelectedTransport(step.id, alt.id);
                              // Update route if this step is active
                              if (isActive) {
                                const gmapsMode = toGoogleMapsMode(alt.mode);
                                setRoute(step.fromPlaceId!, step.toPlaceId!, gmapsMode);
                              }
                            }}
                            className={cn(
                              'flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] border transition-all',
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary'
                                : 'bg-card text-muted-foreground border-border hover:border-primary/40'
                            )}
                          >
                            <AltIcon className="h-2 w-2" />
                            <span className="font-medium">{alt.label}</span>
                            <span className="opacity-70">· {alt.duration}</span>
                            <span className="opacity-70">· {alt.cost}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Single transport info */}
                  {step.isMovement && (!step.transportAlternatives || step.transportAlternatives.length === 0) && step.transportDuration && (
                    <div className="mt-0.5 text-[10px] text-muted-foreground">
                      ⏱ {step.transportDuration} · {step.transportCost}
                    </div>
                  )}

                  {/* Notes (only when detail shown) */}
                  {showDetail && (step.notes || step.transportNotes) && (
                    <div className="mt-1 text-[10px] text-muted-foreground italic leading-snug bg-muted/50 rounded p-1.5">
                      {step.transportNotes || step.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip */}
      <div className="text-[10px] text-muted-foreground italic px-2 py-1.5 bg-muted/30 rounded-lg">
        💡 Clic en un paso para ver la ruta en el mapa · Clic again para ver detalles
      </div>
    </div>
  );
}
