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
  getEffectiveTransportMode,
  isSameZone,
  transportNames,
  getEffectiveTransportDetails,
  getZoneTextForGroup,
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
  Train,
  ChevronDown,
  ChevronUp,
  Layers
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


const groupThemes = [
  {
    name: 'Verde Cerros ⛰️',
    border: 'border-emerald-500/80',
    bg: 'bg-emerald-50/10 dark:bg-emerald-950/5',
    text: 'text-emerald-800 dark:text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20',
    glow: 'ring-emerald-500/20',
    accent: '#2D6A4F'
  },
  {
    name: 'Ladrillo Colonial 🟥',
    border: 'border-red-500/80',
    bg: 'bg-red-50/10 dark:bg-red-950/5',
    text: 'text-red-800 dark:text-red-400',
    badge: 'bg-red-500/10 text-red-800 dark:text-red-300 border-red-500/20',
    glow: 'ring-red-500/20',
    accent: '#B14A2E'
  },
  {
    name: 'Oro Precolombino 🪙',
    border: 'border-amber-500/80',
    bg: 'bg-amber-50/10 dark:bg-amber-950/5',
    text: 'text-amber-800 dark:text-amber-400',
    badge: 'bg-amber-500/10 text-amber-800 dark:text-amber-300 border-amber-500/20',
    glow: 'ring-amber-500/20',
    accent: '#D4AF37'
  },
  {
    name: 'Índigo Cielo 🌌',
    border: 'border-indigo-500/80',
    bg: 'bg-indigo-50/10 dark:bg-indigo-950/5',
    text: 'text-indigo-800 dark:text-indigo-400',
    badge: 'bg-indigo-500/10 text-indigo-800 dark:text-indigo-300 border-indigo-500/20',
    glow: 'ring-indigo-500/20',
    accent: '#4F46E5'
  },
  {
    name: 'Rosa Buganvilia 🌸',
    border: 'border-rose-500/80',
    bg: 'bg-rose-50/10 dark:bg-rose-950/5',
    text: 'text-rose-800 dark:text-rose-400',
    badge: 'bg-rose-500/10 text-rose-800 dark:text-rose-300 border-rose-500/20',
    glow: 'ring-rose-500/20',
    accent: '#E11D48'
  }
];

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
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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

  // Group steps dynamically based on zone (adjacent activities connected by walking, internal, or direct adjacency)
  const timelineNodes = useMemo(() => {
    const nodes: {
      id: string;
      type: 'single' | 'group';
      step?: PlanStep;
      steps?: PlanStep[];
      activities?: PlanStep[];
    }[] = [];

    let i = 0;
    while (i < steps.length) {
      const current = steps[i];
      if (current.type === 'movilidad') {
        nodes.push({ id: current.id, type: 'single', step: current });
        i++;
        continue;
      }

      // Check for grouping (adjacent activities or walking activities in same area)
      const groupStepsList: PlanStep[] = [current];
      const groupActivities: PlanStep[] = [current];

      let j = i + 1;
      while (j < steps.length) {
        const nextStep = steps[j];
        if (!nextStep) break;

        if (nextStep.type !== 'movilidad') {
          // Direct adjacency (e.g. lunch immediately followed by campus tour with no travel card)
          groupStepsList.push(nextStep);
          groupActivities.push(nextStep);
          j++;
        } else if (
          nextStep.type === 'movilidad' &&
          isSameZone(nextStep.fromPlaceId, nextStep.toPlaceId, nextStep, selectedTransport)
        ) {
          // Walk/internal mobility step. Check if followed by a destination card.
          const nextActivity = steps[j + 1];
          if (nextActivity && nextActivity.type !== 'movilidad') {
            groupStepsList.push(nextStep);
            groupStepsList.push(nextActivity);
            groupActivities.push(nextActivity);
            j += 2;
          } else {
            break;
          }
        } else {
          // Long transit stops grouping
          break;
        }
      }

      if (groupActivities.length > 1) {
        const groupId = `group-${groupActivities.map((a) => a.id).join('-')}`;
        nodes.push({
          id: groupId,
          type: 'group',
          steps: groupStepsList,
          activities: groupActivities
        });
        i = j;
      } else {
        nodes.push({ id: current.id, type: 'single', step: current });
        i++;
      }
    }
    return nodes;
  }, [steps, selectedTransport]);

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
    const isDefault = !activeCustomPlanId;
    const planId = getOrCreateActiveCustomPlan();
    if (isDefault) {
      setActiveReplacementStepId(`${planId}-${step.id}`);
    } else {
      setActiveReplacementStepId(step.id);
    }
  };

  // Card click behaviour (First-click details)
  const handleCardClick = (step: PlanStep) => {
    selectStep(step.id);
    if (step.placeId) {
      const place = resolvePlace(step.placeId, selectedAlternatives);
      if (place) {
        clearRoute();
        setSelectedPlaceId(place.id);
      }
    }
  };

  // Mobility click behavior (First-click route on map + details panel)
  const handleMobilityClick = (step: PlanStep) => {
    selectStep(step.id);
    setSelectedPlaceId(null);

    if (step.fromPlaceId && step.toPlaceId) {
      const mode = getEffectiveTransportMode(step, selectedTransport);
      const gmapsMode = toGoogleMapsMode(mode);
      setRoute(step.fromPlaceId, step.toPlaceId, gmapsMode);
    }
  };

  // Group click behavior: select and show details on right, second click to expand/collapse
  const handleGroupClick = (groupId: string) => {
    const state = useTravelStore.getState();
    const isSame = state.selectedStepId === groupId;

    selectStep(groupId);
    setSelectedPlaceId(null);
    clearRoute();

    if (isSame) {
      setExpandedGroups((prev) => ({
        ...prev,
        [groupId]: !prev[groupId]
      }));
    }
  };

  const toggleGroupExpand = (e: React.MouseEvent, groupId: string) => {
    e.stopPropagation();
    setExpandedGroups((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  // Helper to get category-specific styling for activity cards
  const getCardStyle = (type: string, isSelected: boolean, groupThemeBorder?: string) => {
    const base = "relative w-full text-left rounded-xl border border-l-[5px] p-4 transition-all cursor-pointer flex flex-col space-y-2 shadow-[0_1px_3px_rgba(0,0,0,0.02)] bg-card";
    const selectedRing = isSelected ? "ring-2 ring-primary border-primary bg-primary/[0.01]" : "";

    const typeStyles = {
      actividad: 'border-indigo-100 dark:border-indigo-950/40 bg-indigo-50/10 dark:bg-indigo-950/5 hover:border-indigo-300',
      comida: 'border-amber-100 dark:border-amber-950/40 bg-amber-50/10 dark:bg-amber-950/5 hover:border-amber-300',
      compra: 'border-rose-100 dark:border-rose-950/40 bg-rose-50/10 dark:bg-rose-950/5 hover:border-rose-300',
      espera: 'border-slate-100 dark:border-slate-800 bg-slate-50/10 dark:bg-slate-950/5 hover:border-slate-300',
      info: 'border-sky-100 dark:border-sky-950/40 bg-sky-50/10 dark:bg-sky-950/5 hover:border-sky-300',
    }[type] || 'border-border bg-card hover:border-primary/50';

    const borderLeft = groupThemeBorder || {
      actividad: 'border-l-indigo-500',
      comida: 'border-l-amber-500',
      compra: 'border-l-rose-500',
      espera: 'border-l-slate-400',
      info: 'border-l-sky-500',
    }[type] || 'border-l-primary';

    return cn(base, typeStyles, borderLeft, selectedRing);
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

  // Group index counter to cycle through groupThemes
  let groupCounter = 0;

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

      {/* Steps List */}
      <div className="space-y-1">
        {timelineNodes.map((node, nodeIdx) => {
          const isNodeSelected = selectedStepId === node.id;
          const showConnectorLine = nodeIdx < timelineNodes.length - 1;

          if (node.type === 'group' && node.activities && node.steps) {
            // Increment group counter and select color theme
            const currentGroupIdx = groupCounter;
            groupCounter++;
            const theme = groupThemes[currentGroupIdx % groupThemes.length];
            const isExpanded = !!expandedGroups[node.id];

            const acts = node.activities;
            const startTime = acts[0].time;
            const endTime = acts[acts.length - 1].time;
            const groupTitle = acts.map((a) => a.activity.replace('Visita a ', '').replace('Almuerzo ', '').replace('Cena ', '').replace('Comprar tarjeta ', 'Tarjeta ')).join(' + ');
            const emojis = acts.map((a) => getStepEmoji(a.type)).join(' ');

            if (isExpanded) {
              // EXPANDED GROUP REPRESENTATION (Inside a beautiful color-coded visual boundary)
              return (
                <div key={node.id} className="relative py-2.5">
                  {showConnectorLine && (
                    <div className="absolute left-[17px] top-12 bottom-[-8px] w-px bg-border" />
                  )}

                  <div className={cn(
                    "w-full rounded-2xl border-l-[6px] border border-border p-3.5 space-y-3.5 transition-all shadow-sm",
                    theme.border,
                    theme.bg
                  )}>
                    {/* Expanded group header (lets user collapse back easily) */}
                    <div
                      onClick={(e) => toggleGroupExpand(e, node.id)}
                      className="flex items-center justify-between pb-2 border-b border-border/60 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="h-4 w-4 text-primary animate-pulse" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-foreground">
                          {getZoneTextForGroup(acts)} ({acts.length} actividades)
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1.5 text-[10px] gap-1 text-muted-foreground hover:bg-muted font-bold"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                        Replegar
                      </Button>
                    </div>

                    {/* Render individual steps inside group boundaries */}
                    <div className="space-y-2">
                      {node.steps.map((innerStep, innerIdx) => {
                        const isStepActive = selectedStepId === innerStep.id;

                        if (innerStep.type === 'movilidad') {
                          // Mobility step inside group
                          const details = getEffectiveTransportDetails(innerStep, selectedTransport);
                          const TransportIcon = transportIcons[details.mode] || Footprints;
                          return (
                            <div
                              key={innerStep.id}
                              onClick={() => handleMobilityClick(innerStep)}
                              className={cn(
                                'flex items-center gap-2 pl-4 py-1.5 rounded-lg text-xs cursor-pointer border border-transparent transition-all hover:bg-muted/10 text-muted-foreground',
                                isStepActive && 'bg-muted/60 border-primary/10 font-medium'
                              )}
                            >
                              <TransportIcon className="h-3 w-3 shrink-0" />
                              <span className="font-mono font-bold text-primary">{innerStep.time}</span>
                              <span>·</span>
                              <span className="font-semibold text-foreground truncate">{innerStep.activity}</span>
                              {details.duration && <span className="opacity-80">({details.duration})</span>}
                            </div>
                          );
                        }

                        // Activity step inside group (draggable and fully interactive)
                        const innerActIdx = activitiesOnly.findIndex((a) => a.id === innerStep.id);
                        const placeObj = resolvePlace(innerStep.placeId, selectedAlternatives);
                        const isReplacingInner = activeReplacementStepId === innerStep.id;

                        return (
                          <div
                            key={innerStep.id}
                            draggable
                            onDragStart={() => handleDragStart(innerActIdx)}
                            onDragOver={(e) => handleDragOver(e, innerActIdx)}
                            onDrop={() => handleDrop(innerActIdx)}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCardClick(innerStep);
                            }}
                            className={cn(
                              getCardStyle(innerStep.type, isStepActive, theme.border.replace('border-', 'border-l-')),
                              draggedIndex === innerActIdx && "opacity-40 scale-[0.98]",
                              "group/inner transition-all duration-200"
                            )}
                          >
                            <div className="flex items-center justify-between">
                              {/* Time editor */}
                              {editingTimeIdx === innerActIdx ? (
                                <Input
                                  value={innerStep.time}
                                  onChange={(e) => handleUpdateTime(innerActIdx, e.target.value)}
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
                                    setEditingTimeIdx(innerActIdx);
                                  }}
                                >
                                  ⏱️ {innerStep.time}
                                </Badge>
                              )}

                              {/* Card buttons */}
                              <div className="flex items-center gap-1 opacity-0 group-hover/inner:opacity-100 transition-opacity focus-within:opacity-100">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReplaceClick(innerStep);
                                  }}
                                  className={cn(
                                    "h-6 px-1.5 text-[10px] font-bold gap-1 border-primary/20 text-primary hover:bg-primary/5",
                                    isReplacingInner && "bg-primary text-primary-foreground border-primary"
                                  )}
                                >
                                  <RefreshCw className={cn("h-3 w-3", isReplacingInner && "animate-spin")} />
                                  Reemplazar
                                </Button>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveActivity(innerActIdx);
                                  }}
                                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>

                            <div className="flex items-start gap-2 min-w-0">
                              <span className="text-base shrink-0 select-none">
                                {getStepEmoji(innerStep.type)}
                              </span>
                              <div className="min-w-0 space-y-1">
                                <h3 className="font-bold text-sm text-foreground leading-snug">
                                  {innerStep.activity}
                                </h3>
                                {placeObj && (
                                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                                    <MapPin className="h-3 w-3 text-primary shrink-0" />
                                    <span className="font-semibold text-foreground truncate">{placeObj.name}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            } else {
              // COLLAPSED GROUP CARD REPRESENTATION (Visual card displaying summary and order)
              return (
                <div key={node.id} className="relative py-2">
                  {showConnectorLine && (
                    <div className="absolute left-[17px] top-8 bottom-[-8px] w-px bg-border" />
                  )}

                  <div
                    onClick={() => handleGroupClick(node.id)}
                    className={cn(
                      "relative w-full text-left rounded-xl border border-l-[6px] p-4 transition-all cursor-pointer flex flex-col space-y-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.03)] bg-gradient-to-r from-background to-muted/10",
                      theme.border,
                      isNodeSelected ? cn("ring-2 shadow-md bg-card", theme.glow) : "border-border hover:bg-muted/15"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={cn("text-[9.5px] font-mono font-bold bg-background border-none", theme.badge)}>
                        ⏱️ {startTime} - {endTime}
                      </Badge>

                      {/* Small chevron in the corner to toggle expand directly */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => toggleGroupExpand(e, node.id)}
                        className={cn("h-6 w-6 p-0 hover:bg-background/20", theme.text)}
                        title="Desplegar actividades del grupo"
                      >
                        <ChevronDown className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-start gap-2.5 min-w-0">
                      <span className="text-base shrink-0 select-none bg-background/80 p-1.5 rounded-lg border">
                        📦
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#2D6A4F]">{getZoneTextForGroup(acts)}</span>
                          <Badge className={cn("text-[9.5px] py-0 h-4 border-none font-bold shrink-0", theme.badge)}>
                            {acts.length} actividades
                          </Badge>
                        </div>
                        <h3 className="font-bold text-sm text-foreground leading-snug mt-1 truncate">
                          {groupTitle}
                        </h3>
                        <p className="text-[10.5px] text-muted-foreground mt-0.5 truncate">
                          {emojis} {acts.map(a => a.activity.replace('Visita a ', '').replace('Almuerzo ', '')).join(' → ')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          }

          // SINGLE NODE (either mobility step or activity step)
          const step = node.step!;

          if (step.type === 'movilidad') {
            const details = getEffectiveTransportDetails(step, selectedTransport);
            const TransportIcon = transportIcons[details.mode] || Car;
            const modeName = details.label;

            return (
              <div key={step.id} className="relative py-1">
                {showConnectorLine && (
                  <div className="absolute left-[17px] top-6 bottom-[-6px] w-px border-l border-dashed border-muted-foreground/30" />
                )}

                <div
                  onClick={() => handleMobilityClick(step)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleMobilityClick(step); } }}
                  className={cn(
                    'group relative w-full text-left rounded-xl transition-all p-2 pl-10 cursor-pointer text-xs border border-transparent',
                    isNodeSelected
                      ? 'bg-muted/70 border-primary/20 ring-1 ring-primary/10 font-medium'
                      : 'hover:bg-muted/10'
                  )}
                >
                  <div className={cn(
                    'absolute left-2.5 top-2 w-5 h-5 rounded-full flex items-center justify-center border transition-all text-[10px]',
                    isNodeSelected ? 'bg-primary border-primary text-primary-foreground scale-105 shadow-sm' : 'bg-muted/30 border-border text-muted-foreground'
                  )}>
                    <TransportIcon className="h-3 w-3" />
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap text-muted-foreground text-[11px]">
                    <span className="font-mono font-bold text-primary">{step.time}</span>
                    <span>·</span>
                    <span className="font-semibold text-foreground">
                      {modeName}
                    </span>
                    {details.duration && (
                      <span className="inline-flex items-center gap-0.5 text-muted-foreground">
                        ⏱️ {details.duration}
                      </span>
                    )}
                    {details.cost && details.cost !== 'Gratis' && (
                      <span className="inline-flex items-center gap-0.5 text-primary/80 font-mono font-bold">
                        💵 {details.cost}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          }

          // DESTINATION STEP
          const actIdx = activitiesOnly.findIndex((a) => a.id === step.id);
          const place = resolvePlace(step.placeId, selectedAlternatives);
          const isReplacing = activeReplacementStepId === step.id;

          return (
            <div key={step.id} className="relative py-1.5">
              {showConnectorLine && (
                <div className="absolute left-[17px] top-8 bottom-[-8px] w-px bg-border" />
              )}

              <div
                draggable
                onDragStart={() => handleDragStart(actIdx)}
                onDragOver={(e) => handleDragOver(e, actIdx)}
                onDrop={() => handleDrop(actIdx)}
                onClick={() => handleCardClick(step)}
                className={cn(
                  getCardStyle(step.type, isNodeSelected),
                  draggedIndex === actIdx && "opacity-40 scale-[0.98]",
                  "group transition-all duration-200"
                )}
              >
                <div className="flex items-center justify-between">
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
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

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

      <div className="text-[10.5px] text-muted-foreground/80 leading-relaxed bg-muted/40 border border-border/50 rounded-xl p-3">
        💡 <span className="font-bold text-foreground">Tip:</span> Actividades contiguas a pie se agrupan automáticamente por colores. Haz clic en la cabecera del grupo o chevron 📦 para colapsar y expandir.
      </div>
    </div>
  );
}
