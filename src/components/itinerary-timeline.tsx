'use client';

import { useState, useMemo } from 'react';
import {
  dayPlans,
  getPlaceById,
  resolvePlace,
  places,
  reconstructSteps,
  recomputeCustomPlanSteps,
  toGoogleMapsMode,
  type PlanStep,
  type CustomPlan,
  type TransportMode
} from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  CalendarOff,
  AlertTriangle,
  MapPin,
  Utensils,
  ShoppingBag,
  Clock,
  Info,
  RefreshCw,
  Trash2,
  Undo2,
  Bus,
  Car,
  Footprints,
  Train
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

const transportNames: Record<TransportMode, string> = {
  TM: 'TransMilenio 🟥',
  SITP: 'SITP 🟦',
  Tren: 'Tren de la Sabana 🚂',
  Uber: 'Uber / Cabify 🚗',
  Cabify: 'Cabify 🚗',
  Carro: 'Vehículo Particular 🚗',
  Taxi: 'Taxi Oficial 🚖',
  Teleferico: 'Teleférico Monserrate 🚠',
  Caminata: 'Caminata Peatonal 🚶',
  Espera: 'Tiempo de Espera ⏱️',
  Interno: 'Traslado Interno 🚶',
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
  const clearRoute = useTravelStore((s) => s.clearRoute);
  const setRoute = useTravelStore((s) => s.setRoute);

  // Custom Plan store actions
  const customPlans = useTravelStore((s) => s.customPlans);
  const addCustomPlan = useTravelStore((s) => s.addCustomPlan);
  const updateCustomPlan = useTravelStore((s) => s.updateCustomPlan);
  const deleteCustomPlan = useTravelStore((s) => s.deleteCustomPlan);
  const activeCustomPlanId = useTravelStore((s) => s.activeCustomPlanId);
  const setActiveCustomPlan = useTravelStore((s) => s.setActiveCustomPlan);
  const activeReplacementStepId = useTravelStore((s) => s.activeReplacementStepId);
  const setActiveReplacementStepId = useTravelStore((s) => s.setActiveReplacementStepId);

  // States
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [editingTimeIdx, setEditingTimeIdx] = useState<number | null>(null);

  const dayPlan = useMemo(() => dayPlans.find((d) => d.day === selectedDay), [selectedDay]);

  const steps = overrideSteps || dayPlan?.plan || [];
  const title = dayTitle || dayPlan?.title || '';
  const subtitle = daySubtitle || dayPlan?.subtitle || '';
  const showFeriado = isFeriado ?? dayPlan?.isFeriado;
  const showMedica = isRestriccionMedica ?? dayPlan?.isRestriccionMedica;
  const cost = estimatedCost || dayPlan?.estimatedCost || '';

  // Get only the activities (destination steps) for Drag & Drop indexes mapping
  const activitiesOnly = useMemo(() => {
    return steps.filter((s) => s.type !== 'movilidad');
  }, [steps]);

  // Helper to ensure a custom plan exists before modification
  const getOrCreateActiveCustomPlan = (): string => {
    if (activeCustomPlanId) {
      return activeCustomPlanId;
    }
    const id = `custom-${Date.now()}`;
    const baseSteps = dayPlan?.plan.map((s) => ({ ...s, id: `${id}-${s.id}` })) || [];
    const plan: CustomPlan = {
      id,
      name: `Mi Plan - Día ${selectedDay}`,
      description: `Itinerario personalizado del día ${selectedDay}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      basedOnDay: selectedDay,
      steps: recomputeCustomPlanSteps(baseSteps),
    };
    addCustomPlan(plan);
    setActiveCustomPlan(id);
    return id;
  };

  // Drag & Drop Handlers for activities
  const handleDragStart = (idx: number) => {
    setDraggedIndex(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedIndex === null || draggedIndex === targetIdx) return;
    const updatedActivities = [...activitiesOnly];
    const [removed] = updatedActivities.splice(draggedIndex, 1);
    updatedActivities.splice(targetIdx, 0, removed);

    const newSteps = reconstructSteps(updatedActivities);
    const planId = getOrCreateActiveCustomPlan();
    updateCustomPlan(planId, { steps: newSteps });
    setDraggedIndex(null);
  };

  // Time update
  const handleUpdateTime = (idx: number, newTime: string) => {
    const updatedActivities = activitiesOnly.map((act, i) =>
      i === idx ? { ...act, time: newTime } : act
    );
    const newSteps = reconstructSteps(updatedActivities);
    const planId = getOrCreateActiveCustomPlan();
    updateCustomPlan(planId, { steps: newSteps });
  };

  // Remove activity
  const handleRemoveActivity = (idx: number) => {
    const updatedActivities = activitiesOnly.filter((_, i) => i !== idx);
    const newSteps = reconstructSteps(updatedActivities);
    const planId = getOrCreateActiveCustomPlan();
    updateCustomPlan(planId, { steps: newSteps });
    if (activeReplacementStepId === activitiesOnly[idx]?.id) {
      setActiveReplacementStepId(null);
    }
  };

  // Replace action
  const handleReplaceClick = (step: PlanStep) => {
    getOrCreateActiveCustomPlan();
    setActiveReplacementStepId(step.id);
  };

  // Card click behaviour (First-click details)
  const handleCardClick = (step: PlanStep) => {
    selectStep(step.id);
    if (step.placeId) {
      const place = resolvePlace(step.placeId, selectedAlternatives);
      if (place) {
        clearRoute();
        // First click instantly displays details
        setSelectedPlaceId(place.id);
      }
    }
  };

  // Mobility click behavior (First-click route on map + details panel)
  const handleMobilityClick = (step: PlanStep) => {
    selectStep(step.id);
    setSelectedPlaceId(null); // Clear selected place detail to show route detail

    if (step.fromPlaceId && step.toPlaceId) {
      let mode = step.transportMode;
      if (step.transportAlternatives && step.transportAlternatives.length > 0) {
        const selectedAltId = selectedTransport[step.id];
        const selectedAlt = step.transportAlternatives.find((a) => a.id === selectedAltId)
          || step.transportAlternatives.find((a) => a.isRecommended)
          || step.transportAlternatives[0];
        if (selectedAlt) mode = selectedAlt.mode;
      }
      const gmapsMode = toGoogleMapsMode(mode);
      setRoute(step.fromPlaceId, step.toPlaceId, gmapsMode);
    }
  };

  // Helper to get category-specific styling for activity cards
  const getCardStyle = (type: string, isSelected: boolean) => {
    const base = "relative w-full text-left rounded-xl border border-l-[5px] p-4 transition-all cursor-pointer flex flex-col space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)] bg-card";
    const selectedRing = isSelected ? "ring-2 ring-primary border-primary bg-primary/[0.01]" : "";

    const typeStyles = {
      actividad: 'border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/10 dark:bg-indigo-950/5 border-l-indigo-500 hover:border-indigo-300',
      comida: 'border-amber-100 dark:border-amber-950/40 bg-amber-50/10 dark:bg-amber-950/5 border-l-amber-500 hover:border-amber-300',
      compra: 'border-rose-100 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/5 border-l-rose-500 hover:border-rose-300',
      espera: 'border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-950/5 border-l-slate-400 hover:border-slate-300',
      info: 'border-sky-100 dark:border-sky-950/40 bg-sky-50/10 dark:bg-sky-950/5 border-l-sky-500 hover:border-sky-300',
    }[type] || 'border-border bg-card border-l-primary hover:border-primary/50';

    return cn(base, typeStyles, selectedRing);
  };

  const getStepEmoji = (type: string) => {
    return {
      actividad: '📍',
      comida: '🍽️',
      compra: '🛍️',
      espera: '⏱️',
      info: 'ℹ️',
    }[type] || '✨';
  };

  return (
    <div className="space-y-4">
      {/* Day header - compact */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-border">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-primary">
              Día {selectedDay}
            </span>
            {activeCustomPlanId && (
              <Badge variant="default" className="text-[9px] py-0 h-4 bg-primary/10 text-primary hover:bg-primary/20 border-none font-bold">
                ✨ Personalizado
              </Badge>
            )}
            {showFeriado && (
              <Badge variant="outline" className="text-[9px] py-0 h-4 text-amber-700 border-amber-400 bg-amber-50">
                <CalendarOff className="h-2.5 w-2.5 mr-0.5" /> Feriado
              </Badge>
            )}
            {showMedica && (
              <Badge variant="outline" className="text-[9px] py-0 h-4 text-red-700 border-red-300 bg-red-50">
                <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Ojo dilato
              </Badge>
            )}
          </div>
          <h2 className="text-base font-bold leading-tight">{title}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        {cost && (
          <div className="text-right shrink-0">
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Presupuesto</div>
            <div className="text-xs font-bold text-primary">{cost}</div>
          </div>
        )}
      </div>

      {/* Discard Customizations / Reset Option */}
      {activeCustomPlanId && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-primary/[0.02] border border-primary/10 text-xs">
          <span className="text-muted-foreground text-[11px]">Estás editando una versión personalizada de este día.</span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => {
              deleteCustomPlan(activeCustomPlanId);
              setActiveCustomPlan(null);
              setActiveReplacementStepId(null);
            }}
            className="h-6 text-[10px] px-2 text-destructive hover:bg-destructive/10 font-bold"
          >
            <Undo2 className="h-3 w-3 mr-1" /> Resetear día
          </Button>
        </div>
      )}

      {/* Steps List (showing both activities and mobility) */}
      <div className="space-y-1">
        {steps.map((step, idx) => {
          const isStepSelected = selectedStepId === step.id;

          if (step.type === 'movilidad') {
            // MOBILITY / CONNECTOR STEP
            let effectiveMode = step.transportMode || 'Uber';
            const selectedAltId = selectedTransport[step.id];
            if (step.transportAlternatives && step.transportAlternatives.length > 0) {
              const alt = step.transportAlternatives.find((a) => a.id === selectedAltId)
                || step.transportAlternatives.find((a) => a.isRecommended)
                || step.transportAlternatives[0];
              if (alt) effectiveMode = alt.mode;
            }
            const TransportIcon = transportIcons[effectiveMode] || Car;
            const modeName = transportNames[effectiveMode] || 'Traslado';

            return (
              <div key={step.id} className="relative py-1">
                {/* Visual vertical connector line */}
                {idx < steps.length - 1 && (
                  <div className="absolute left-[17px] top-6 bottom-[-6px] w-px border-l border-dashed border-muted-foreground/30" />
                )}

                <div
                  onClick={() => handleMobilityClick(step)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMobilityClick(step); } }}
                  className={cn(
                    'group relative w-full text-left rounded-xl transition-all p-2 pl-10 cursor-pointer text-xs border border-transparent',
                    isStepSelected
                      ? 'bg-muted/70 border-primary/20 ring-1 ring-primary/10 font-medium'
                      : 'hover:bg-muted/10'
                  )}
                >
                  {/* Transport Icon */}
                  <div className={cn(
                    'absolute left-2.5 top-2 w-5 h-5 rounded-full flex items-center justify-center border transition-all text-[10px]',
                    isStepSelected ? 'bg-primary border-primary text-primary-foreground scale-105 shadow-sm' : 'bg-muted/30 border-border text-muted-foreground'
                  )}>
                    <TransportIcon className="h-3 w-3" />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-muted-foreground text-[11px]">
                    <span className="font-mono font-bold text-primary">{step.time}</span>
                    <span>·</span>
                    <span className="font-semibold text-foreground">
                      {modeName}
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
                </div>
              </div>
            );
          }

          // DESTINATION STEP (Actividad, Comida, Compra, Info, Espera)
          // Find its index in activitiesOnly to pass the correct indexes for drag & drop reordering
          const actIdx = activitiesOnly.findIndex((a) => a.id === step.id);
          const place = resolvePlace(step.placeId, selectedAlternatives);
          const isReplacing = activeReplacementStepId === step.id;

          return (
            <div key={step.id} className="relative py-1.5">
              {/* Visual vertical connector line */}
              {idx < steps.length - 1 && (
                <div className="absolute left-[17px] top-8 bottom-[-8px] w-px bg-border" />
              )}

              <div
                draggable
                onDragStart={() => handleDragStart(actIdx)}
                onDragOver={(e) => handleDragOver(e, actIdx)}
                onDrop={() => handleDrop(actIdx)}
                onClick={() => handleCardClick(step)}
                className={cn(
                  getCardStyle(step.type, isStepSelected),
                  draggedIndex === actIdx && "opacity-40 scale-[0.98]",
                  "group transition-all duration-200"
                )}
              >
                {/* Header row: Time adjustment + Replace / Delete actions */}
                <div className="flex items-center justify-between">
                  {/* Time badge / Inline Editor */}
                  {editingTimeIdx === actIdx ? (
                    <Input
                      value={step.time}
                      onChange={(e) => handleUpdateTime(actIdx, e.target.value)}
                      onBlur={() => setEditingTimeIdx(null)}
                      onKeyDown={(e) => { if (e.key === 'Enter') setEditingTimeIdx(null); }}
                      className="h-6 w-24 text-[10.5px] font-mono p-1 rounded border bg-background"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  ) : (
                    <Badge
                      variant="secondary"
                      className="text-[9.5px] font-mono font-bold hover:bg-muted bg-background py-0.5 px-2 border border-border"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingTimeIdx(actIdx);
                      }}
                    >
                      ⏱️ {step.time}
                    </Badge>
                  )}

                  {/* Actions buttons */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReplaceClick(step);
                      }}
                      className={cn(
                        "h-6 px-1.5 text-[10px] font-bold gap-1 border-primary/20 text-primary hover:bg-primary/5",
                        isReplacing && "bg-primary text-primary-foreground border-primary"
                      )}
                      title="Reemplazar esta actividad por otra"
                    >
                      <RefreshCw className={cn("h-3 w-3", isReplacing && "animate-spin")} />
                      Reemplazar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveActivity(actIdx);
                      }}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Eliminar"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {/* Body: Emoji + Activity title */}
                <div className="flex items-start gap-2 min-w-0">
                  <span className="text-base shrink-0 select-none">
                    {getStepEmoji(step.type)}
                  </span>
                  <div className="min-w-0 space-y-1">
                    <h3 className="font-bold text-sm text-foreground leading-snug">
                      {step.activity}
                    </h3>

                    {place && (
                      <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <MapPin className="h-3 w-3 text-primary shrink-0" />
                        <span className="font-semibold text-foreground truncate">{place.name}</span>
                        {place.priceRange && (
                          <span className="text-[10px] text-primary/80 font-bold bg-primary/5 px-1 rounded">
                            {place.priceRange.split(' por')[0]}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtitle / Notes input */}
                <Input
                  value={step.notes || ''}
                  onChange={(e) => {
                    const updatedActivities = activitiesOnly.map((act, i) =>
                      i === actIdx ? { ...act, notes: e.target.value } : act
                    );
                    const newSteps = reconstructSteps(updatedActivities);
                    const planId = getOrCreateActiveCustomPlan();
                    updateCustomPlan(planId, { steps: newSteps });
                  }}
                  placeholder="Añadir nota rápida..."
                  className="h-6 text-[10px] border-none shadow-none focus-visible:ring-0 p-0 text-muted-foreground/80 placeholder-muted-foreground/30 bg-transparent"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Tip explaining drag and click to replacement */}
      <div className="text-[10.5px] text-muted-foreground/80 leading-relaxed bg-muted/40 border border-border/50 rounded-xl p-3">
        💡 <span className="font-bold text-foreground">Tip:</span> Haz clic en las tarjetas o trayectos para ver su información en el panel derecho al instante. Reorganiza actividades arrastrándolas.
      </div>
    </div>
  );
}
