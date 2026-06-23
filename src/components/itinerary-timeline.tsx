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
  movilidad: { icon: Car, color: 'text-orange-500', bg: 'bg-orange-500/10 border-orange-200', label: 'Trayecto' },
  actividad: { icon: MapPin, color: 'text-indigo-600', bg: 'bg-indigo-500/10 border-indigo-200', label: 'Actividad' },
  comida: { icon: Utensils, color: 'text-amber-700', bg: 'bg-amber-500/10 border-amber-200', label: 'Comida' },
  compra: { icon: ShoppingBag, color: 'text-violet-600', bg: 'bg-violet-500/10 border-violet-200', label: 'Compra' },
  espera: { icon: Clock, color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-200', label: 'Espera' },
  info: { icon: Info, color: 'text-sky-600', bg: 'bg-sky-500/10 border-sky-200', label: 'Info' },
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

          if (step.isMovement) {
            // MOVEMENT / TRANSIT STEP: render as a compact, subtle connector
            return (
              <div key={step.id} className="relative py-1">
                {/* Timeline connector line inside movement */}
                {idx < steps.length - 1 && (
                  <div className="absolute left-[15px] top-6 bottom-[-6px] w-px border-l border-dashed border-muted-foreground/30" />
                )}

                <div
                  onClick={() => handleStepClick(step)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStepClick(step); } }}
                  className={cn(
                    'group relative w-full text-left rounded-xl transition-all p-2 pl-10 cursor-pointer text-xs border border-transparent',
                    isActive
                      ? 'bg-muted/60 border-primary/20 ring-1 ring-primary/10 font-medium'
                      : 'hover:bg-muted/10'
                  )}
                >
                  {/* Small step icon */}
                  <div className={cn(
                    'absolute left-2.5 top-2 w-5 h-5 rounded-full flex items-center justify-center border transition-all text-xs',
                    isActive ? 'bg-primary border-primary text-primary-foreground scale-105 shadow-sm' : 'bg-muted/30 border-border text-muted-foreground'
                  )}>
                    {TransportIcon ? <TransportIcon className="h-2.5 w-2.5" /> : <StepIcon className="h-2.5 w-2.5" />}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-muted-foreground text-[11px]">
                    <span className="font-mono font-bold text-primary">{step.time}</span>
                    <span>·</span>
                    <span className="font-semibold text-foreground">
                      {step.activity.replace('Traslado ', 'Ir: ').replace('Trayecto ', '')}
                    </span>
                    {step.transportDuration && (
                      <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                        ⏱️ {step.transportDuration}
                      </span>
                    )}
                    {step.transportCost && (
                      <span className="inline-flex items-center gap-0.5 text-primary/80 font-mono font-bold">
                        💵 {step.transportCost}
                      </span>
                    )}
                  </div>

                  {/* Selector for multi-transport alternatives shown inside */}
                  {step.transportAlternatives && step.transportAlternatives.length > 1 && (
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
                              if (isActive) {
                                const gmapsMode = toGoogleMapsMode(alt.mode);
                                setRoute(step.fromPlaceId!, step.toPlaceId!, gmapsMode);
                              }
                            }}
                            className={cn(
                              'flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] border transition-all',
                              isSelected
                                ? 'bg-primary text-primary-foreground border-primary shadow-[0_1px_2px_rgba(0,0,0,0.05)]'
                                : 'bg-card text-muted-foreground border-border hover:border-primary/30'
                            )}
                          >
                            <AltIcon className="h-2 w-2" />
                            <span>{alt.label}</span>
                            <span>· {alt.duration}</span>
                            <span>· {alt.cost}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Notes shown if active */}
                  {showDetail && step.transportNotes && (
                    <div className="mt-1 text-[10px] text-muted-foreground italic leading-relaxed bg-card border border-border/60 rounded p-1.5">
                      {step.transportNotes}
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // DESTINATION STEP (Actividad, Comida, Compra, Info, Espera)
          const leftBorderColor = {
            actividad: 'border-l-indigo-500 bg-indigo-50/10 dark:bg-indigo-950/5',
            comida: 'border-l-amber-500 bg-amber-50/10 dark:bg-amber-950/5',
            compra: 'border-l-rose-500 bg-rose-50/10 dark:bg-rose-950/5',
            espera: 'border-l-slate-400 bg-slate-50/10 dark:bg-slate-950/5',
            info: 'border-l-sky-500 bg-sky-50/10 dark:bg-sky-950/5',
          }[step.type] || 'border-l-border bg-card';

          const activeBorderColor = {
            actividad: 'border-indigo-300 dark:border-indigo-900 bg-indigo-50/30 dark:bg-indigo-950/15 ring-indigo-500/10',
            comida: 'border-amber-300 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/15 ring-amber-500/10',
            compra: 'border-rose-300 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/15 ring-rose-500/10',
            espera: 'border-slate-300 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-950/15 ring-slate-400/10',
            info: 'border-sky-300 dark:border-sky-900 bg-sky-50/30 dark:bg-sky-950/15 ring-sky-500/10',
          }[step.type] || 'border-primary bg-card';

          return (
            <div key={step.id} className="relative py-1.5">
              {/* Timeline connector */}
              {idx < steps.length - 1 && (
                <div className="absolute left-[15px] top-8 bottom-[-8px] w-px bg-border" />
              )}

              <div
                onClick={() => handleStepClick(step)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleStepClick(step); } }}
                className={cn(
                  'group relative w-full text-left rounded-xl border border-l-[5px] transition-all p-3 pl-10 cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)]',
                  isActive
                    ? cn(activeBorderColor, 'ring-1 border-l-[5px]')
                    : cn(leftBorderColor, 'border-border/80 hover:border-primary/30 hover:bg-muted/20')
                )}
              >
                {/* Step icon */}
                <div className={cn(
                  'absolute left-2.5 top-3 w-5.5 h-5.5 rounded-full flex items-center justify-center border-2 transition-transform text-xs',
                  isActive 
                    ? 'bg-primary border-primary text-primary-foreground scale-105 shadow-sm' 
                    : cn('bg-card border-border', config.color)
                )}>
                  <StepIcon className="h-2.5 w-2.5" />
                </div>

                {/* Content */}
                <div className="min-w-0 space-y-0.5">
                  {/* Time + type badge */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono font-bold text-primary">{step.time}</span>
                    <Badge variant="outline" className={cn('text-[9px] py-0 px-1 h-3.5 border-current/25 font-bold uppercase tracking-wider', config.color)}>
                      {config.label}
                    </Badge>
                    {showDetail && (
                      <ChevronRight className="h-3.5 w-3.5 text-primary ml-auto animate-pulse" />
                    )}
                  </div>

                  {/* Activity */}
                  <div className="text-xs font-semibold text-foreground leading-snug">
                    {step.activity}
                  </div>

                  {/* Place name */}
                  {place && (
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground truncate">{place.name}</span>
                      {place.priceRange && (
                        <span className="text-[9.5px] text-primary/80 font-bold ml-1">
                          💵 {place.priceRange.split(' por')[0]}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Notes (only when detail shown) */}
                  {showDetail && step.notes && (
                    <div className="mt-2 text-[10px] text-muted-foreground italic leading-relaxed bg-card border border-border/60 rounded p-2">
                      {step.notes}
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
        💡 Clic en un paso para ver la ruta en el mapa · Doble clic para ver detalles del lugar
      </div>
    </div>
  );
}
