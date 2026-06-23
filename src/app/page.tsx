'use client';

import { useState, useMemo } from 'react';
import {
  dayPlans,
  resolvePlace,
  places,
  getPlaceById,
  getDistance,
  reconstructSteps,
  recomputeCustomPlanSteps,
  toGoogleMapsMode
} from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import dynamic from 'next/dynamic';
import PlaceDetail from '@/components/place-detail';
import RouteDetail from '@/components/route-detail';
import ItineraryTimeline from '@/components/itinerary-timeline';
import ExplorarList from '@/components/explorar-list';
import InfoPanel from '@/components/info-panel';
import PlanEditor from '@/components/plan-editor';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mountain, MapPin, Info, CalendarDays, Edit3, Search, X, RefreshCw, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';

const TravelMap = dynamic(() => import('@/components/travel-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[400px] w-full bg-muted/30 rounded-xl flex items-center justify-center text-sm text-muted-foreground">
      <div className="text-center">
        <div className="animate-pulse h-8 w-8 mx-auto mb-2 rounded-full bg-primary/30" />
        Cargando mapa de la Sabana...
      </div>
    </div>
  ),
});

type MainView = 'explorar' | 'info' | 'mi-plan' | 'itinerario';

export default function Home() {
  const mainView = useTravelStore((s) => s.mainView);
  const setMainView = useTravelStore((s) => s.setMainView);
  const selectedDay = useTravelStore((s) => s.selectedDay);
  const setSelectedDay = useTravelStore((s) => s.setSelectedDay);
  const selectedPlaceId = useTravelStore((s) => s.selectedPlaceId);
  const selectedAlternatives = useTravelStore((s) => s.selectedAlternatives);
  const selectedStepId = useTravelStore((s) => s.selectedStepId);
  const stepClickCount = useTravelStore((s) => s.stepClickCount);
  const customPlans = useTravelStore((s) => s.customPlans);
  const activeCustomPlanId = useTravelStore((s) => s.activeCustomPlanId);
  const updateCustomPlan = useTravelStore((s) => s.updateCustomPlan);
  const setSelectedPlaceId = useTravelStore((s) => s.setSelectedPlaceId);

  // Replacement panel store states
  const activeReplacementStepId = useTravelStore((s) => s.activeReplacementStepId);
  const setActiveReplacementStepId = useTravelStore((s) => s.setActiveReplacementStepId);

  // Local state for replacement panel search
  const [swapSearch, setSwapSearch] = useState('');

  const dayPlan = useMemo(() => dayPlans.find((d) => d.day === selectedDay), [selectedDay]);
  const activeCustomPlan = useMemo(() => customPlans.find((p) => p.id === activeCustomPlanId), [customPlans, activeCustomPlanId]);

  // Retrieve custom plans belonging to this specific selected day
  const customPlansForDay = useMemo(() => {
    return customPlans.filter((p) => p.basedOnDay === selectedDay);
  }, [customPlans, selectedDay]);

  // Place IDs for this day (for map highlighting)
  const highlightedPlaceIds = useMemo(() => {
    const stepsToUse = activeCustomPlan ? activeCustomPlan.steps : (dayPlan?.plan || []);
    const ids = new Set<string>();
    stepsToUse.forEach((step) => {
      [step.placeId, step.fromPlaceId, step.toPlaceId].forEach((pid) => {
        if (pid) ids.add(pid);
      });
    });
    dayPlan?.alternatives?.forEach((alt) => alt.placeIds.forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [dayPlan, activeCustomPlan]);

  const selectedPlace = selectedPlaceId ? resolvePlace(selectedPlaceId, selectedAlternatives) : null;

  // Selected step details
  const selectedStep = useMemo(() => {
    if (!selectedStepId || !dayPlan) return null;
    const stepsToUse = activeCustomPlan ? activeCustomPlan.steps : dayPlan.plan;
    return stepsToUse.find((s) => s.id === selectedStepId) || null;
  }, [selectedStepId, dayPlan, activeCustomPlan]);

  const selectedStepIdx = useMemo(() => {
    if (!selectedStepId || !dayPlan) return -1;
    const stepsToUse = activeCustomPlan ? activeCustomPlan.steps : dayPlan.plan;
    return stepsToUse.findIndex((s) => s.id === selectedStepId);
  }, [selectedStepId, dayPlan, activeCustomPlan]);

  // Selected Group reconstruction (Requested)
  const selectedGroupNode = useMemo(() => {
    if (!selectedStepId || !selectedStepId.startsWith('group-') || !dayPlan) return null;
    const stepsToUse = activeCustomPlan ? activeCustomPlan.steps : dayPlan.plan;
    const stepIds = selectedStepId.replace('group-', '').split('-');
    return stepsToUse.filter((s) => stepIds.includes(s.id));
  }, [selectedStepId, dayPlan, activeCustomPlan]);

  // When a step is selected, center the map on that step's place
  const stepPlaceForMap = useMemo(() => {
    if (!selectedStepId || !dayPlan) return null;
    const stepsToUse = activeCustomPlan ? activeCustomPlan.steps : dayPlan.plan;
    const step = stepsToUse.find((s) => s.id === selectedStepId);
    if (!step) return null;
    const placeId = step.placeId || step.toPlaceId || step.fromPlaceId;
    if (!placeId) return null;
    return resolvePlace(placeId, selectedAlternatives);
  }, [selectedStepId, dayPlan, activeCustomPlan, selectedAlternatives]);

  // Show detail panels at the FIRST click (stepClickCount >= 1)
  const showPlaceDetailPanel = selectedPlace && mainView === 'itinerario' && stepClickCount >= 1;
  const showRouteDetailPanel = selectedStep && selectedStep.type === 'movilidad' && mainView === 'itinerario' && stepClickCount >= 1;
  const showGroupDetailPanel = selectedGroupNode && mainView === 'itinerario' && stepClickCount >= 1;

  // Clone or activate custom plan
  const getOrCreateActiveCustomPlan = (): string => {
    if (activeCustomPlanId) {
      return activeCustomPlanId;
    }
    const id = `custom-${Date.now()}`;
    const baseSteps = dayPlan?.plan.map((s) => ({ ...s, id: `${id}-${s.id}` })) || [];
    const plan = {
      id,
      name: `Mi Plan - Día ${selectedDay}`,
      description: `Itinerario personalizado del día ${selectedDay}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      basedOnDay: selectedDay,
      steps: recomputeCustomPlanSteps(baseSteps),
    };
    useTravelStore.getState().addCustomPlan(plan);
    useTravelStore.getState().setActiveCustomPlan(id);
    return id;
  };

  // Select transport mode and update the map route in real-time (Requested)
  const handleSelectTransportMode = (idx: number, mode: any) => {
    const planId = getOrCreateActiveCustomPlan();
    const state = useTravelStore.getState();
    const currentPlan = state.customPlans.find((p) => p.id === planId);
    if (!currentPlan) return;

    const updatedSteps = currentPlan.steps.map((s, sIdx) => {
      if (sIdx === idx) {
        return {
          ...s,
          transportMode: mode,
          transportDuration: undefined,
          transportCost: undefined,
        };
      }
      return s;
    });

    const finalSteps = recomputeCustomPlanSteps(updatedSteps);
    updateCustomPlan(planId, { steps: finalSteps });

    // Update map route dynamically in the store
    const updatedStep = finalSteps[idx];
    if (updatedStep && updatedStep.fromPlaceId && updatedStep.toPlaceId) {
      const gmapsMode = toGoogleMapsMode(mode);
      state.setRoute(updatedStep.fromPlaceId, updatedStep.toPlaceId, gmapsMode);
    }
  };

  // Replacement calculations
  const activeReplacementStep = useMemo(() => {
    if (!activeCustomPlan || !activeReplacementStepId) return null;
    return activeCustomPlan.steps.find((s) => s.id === activeReplacementStepId);
  }, [activeCustomPlan, activeReplacementStepId]);

  const activitiesOnlyInPlan = useMemo(() => {
    return activeCustomPlan ? activeCustomPlan.steps.filter((s) => s.type !== 'movilidad') : [];
  }, [activeCustomPlan]);

  const activeSwapIdx = useMemo(() => {
    if (!activitiesOnlyInPlan || !activeReplacementStepId) return -1;
    return activitiesOnlyInPlan.findIndex((s) => s.id === activeReplacementStepId);
  }, [activitiesOnlyInPlan, activeReplacementStepId]);

  const refCoords = useMemo((): [number, number] => {
    if (activeSwapIdx <= 0 || !activitiesOnlyInPlan) {
      return [4.6760, -74.0520]; // Default: Calle 94 lodging
    }
    const prevAct = activitiesOnlyInPlan[activeSwapIdx - 1];
    if (prevAct && prevAct.placeId) {
      const p = getPlaceById(prevAct.placeId);
      if (p && p.coords) return p.coords;
    }
    return [4.6760, -74.0520];
  }, [activeSwapIdx, activitiesOnlyInPlan]);

  const refPlaceName = useMemo(() => {
    if (activeSwapIdx <= 0 || !activitiesOnlyInPlan) {
      return 'Alojamiento Calle 94';
    }
    const prevAct = activitiesOnlyInPlan[activeSwapIdx - 1];
    if (prevAct && prevAct.placeId) {
      const p = getPlaceById(prevAct.placeId);
      if (p) return p.name;
    }
    return 'Alojamiento Calle 94';
  }, [activeSwapIdx, activitiesOnlyInPlan]);

  const proximitySortedPlaces = useMemo(() => {
    if (activeSwapIdx === -1 || !activitiesOnlyInPlan[activeSwapIdx]) return [];
    const currentPlaceId = activitiesOnlyInPlan[activeSwapIdx].placeId;
    return places
      .filter((p) => p.id !== 'alojamiento' && p.coords && p.category !== 'transporte' && p.id !== currentPlaceId)
      .map((p) => {
        const distance = getDistance(refCoords, p.coords);
        return { ...p, distance };
      })
      .sort((a, b) => a.distance - b.distance);
  }, [refCoords, activeSwapIdx, activitiesOnlyInPlan]);

  const filteredPlaces = useMemo(() => {
    const q = swapSearch.toLowerCase().trim();
    if (!q) return proximitySortedPlaces;
    return proximitySortedPlaces.filter(
      (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
    );
  }, [proximitySortedPlaces, swapSearch]);

  const handleSelectAlternative = (newPlaceId: string) => {
    if (activeSwapIdx === -1 || !activeCustomPlan || !activeReplacementStepId) return;
    const newPlace = getPlaceById(newPlaceId);
    if (!newPlace) return;

    const updatedActivities = activitiesOnlyInPlan.map((act) =>
      act.id === activeReplacementStepId
        ? { ...act, placeId: newPlaceId, activity: `Visita a ${newPlace.name}` }
        : act
    );
    const newSteps = reconstructSteps(updatedActivities);
    updateCustomPlan(activeCustomPlan.id, { steps: newSteps });

    // Clear state
    setActiveReplacementStepId(null);
    setSelectedPlaceId(newPlaceId);
    setSwapSearch('');
  };

  const mainTabs: { id: MainView; label: string; icon: any }[] = [
    { id: 'itinerario', label: 'Itinerario', icon: CalendarDays },
    { id: 'explorar', label: 'Explorar Guía', icon: Compass },
    { id: 'mi-plan', label: 'Mis Planes', icon: Edit3 },
    { id: 'info', label: 'Info Bogotá', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* HEADER - Minimalist Local theme (Unused badges removed as requested) */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2D6A4F] to-[#D4AF37] flex items-center justify-center text-primary-foreground shadow-sm">
                <Mountain className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">Bogotá · Plan Maestro</h1>
                <p className="text-[10px] text-muted-foreground leading-tight font-medium">15 - 22 de Julio 2026 · Sabana & Cerros</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN TABS */}
      <div className="border-b border-border bg-card/40">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center gap-0.5 overflow-x-auto custom-scroll">
            {mainTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = mainView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setMainView(tab.id);
                    useTravelStore.getState().clearStepSelection();
                  }}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap',
                    isActive
                      ? 'border-primary text-primary'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                  {tab.id === 'mi-plan' && customPlans.length > 0 && (
                    <Badge variant="secondary" className="text-[9px] h-4 px-1.5 ml-0.5 bg-primary/10 text-primary border-none">
                      {customPlans.length}
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-5">
        {/* ITINERARIO VIEW */}
        {mainView === 'itinerario' && (
          <div className="space-y-4">
            
            {/* Custom Plan Switcher above the Day Selector */}
            {customPlansForDay.length > 0 && (
              <div className="flex items-center gap-2 bg-gradient-to-r from-emerald-500/[0.02] to-amber-500/[0.02] p-2.5 rounded-xl border border-border/80 text-xs shadow-[0_1px_2px_rgba(0,0,0,0.01)]">
                <span className="text-[11px] font-bold text-muted-foreground shrink-0">Plan activo del día:</span>
                <div className="flex items-center gap-1.5 overflow-x-auto custom-scroll">
                  <Button
                    size="sm"
                    variant={activeCustomPlanId === null ? "default" : "outline"}
                    onClick={() => {
                      useTravelStore.getState().setActiveCustomPlan(null);
                      useTravelStore.getState().clearStepSelection();
                    }}
                    className={cn(
                      "h-7 text-xs font-semibold px-2.5 transition-all",
                      activeCustomPlanId === null
                        ? "bg-[#2D6A4F] hover:bg-[#1B4332] text-white border-none shadow-sm"
                        : "border-emerald-600/20 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-500/5"
                    )}
                  >
                    🏛️ Itinerario Base (Oficial)
                  </Button>
                  {customPlansForDay.map((plan) => (
                    <Button
                      key={plan.id}
                      size="sm"
                      variant={activeCustomPlanId === plan.id ? "default" : "outline"}
                      onClick={() => {
                        useTravelStore.getState().setActiveCustomPlan(plan.id);
                        useTravelStore.getState().clearStepSelection();
                      }}
                      className={cn(
                        "h-7 text-xs font-semibold px-2.5 transition-all",
                        activeCustomPlanId === plan.id
                          ? "bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white border-none shadow-sm"
                          : "border-amber-600/20 text-amber-800 dark:text-amber-300 hover:bg-amber-500/5"
                      )}
                    >
                      ✨ {plan.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Day selector */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scroll pb-1">
              <span className="text-xs font-bold text-muted-foreground shrink-0 mr-1">Día:</span>
              {dayPlans.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className={cn(
                    'flex flex-col items-center px-3.5 py-1.5 rounded-xl border text-center transition-all shrink-0 min-w-[64px]',
                    selectedDay === day.day
                      ? 'border-[#2D6A4F] bg-[#2D6A4F] text-white shadow-sm font-bold'
                      : 'border-border bg-card hover:border-[#2D6A4F]/40'
                  )}
                >
                  <span className="text-[9px] uppercase tracking-wide opacity-80">{day.weekday.slice(0, 3)}</span>
                  <span className="text-base font-bold leading-tight">{day.day}</span>
                </button>
              ))}
            </div>

            {/* Itinerary + Map/Replacement grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Left: Itinerary timeline */}
              <div className="lg:col-span-5 space-y-3">
                {activeCustomPlan && activeCustomPlan.steps.length > 0 ? (
                  <ItineraryTimeline
                    steps={activeCustomPlan.steps}
                    dayTitle={activeCustomPlan.name}
                    daySubtitle={activeCustomPlan.description}
                    estimatedCost={activeCustomPlan.estimatedCost}
                  />
                ) : (
                  <ItineraryTimeline />
                )}
              </div>

              {/* Right: Map + Details OR Replacement panel */}
              <div className="lg:col-span-7 space-y-3">
                {activeReplacementStepId && activeReplacementStep ? (
                  /* REPLACEMENT PANEL (Visual & Proximity-based Card selection) */
                  <Card className="border-border shadow-md flex flex-col h-[545px] overflow-hidden bg-card">
                    <div className="p-4 border-b border-border bg-primary/[0.01] flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Reemplazar Actividad
                        </span>
                        <h3 className="font-bold text-sm text-foreground mt-0.5 leading-snug">
                          {activeReplacementStep.activity}
                        </h3>
                        <p className="text-[10.5px] text-muted-foreground mt-0.5">
                          Alternativas por cercanía a: <span className="font-semibold text-foreground">{refPlaceName}</span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setActiveReplacementStepId(null);
                          setSwapSearch('');
                        }}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="p-4 border-b border-border bg-muted/10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          value={swapSearch}
                          onChange={(e) => setSwapSearch(e.target.value)}
                          placeholder="Buscar actividad o lugar de reemplazo..."
                          className="pl-9 h-9 text-xs bg-background border-border"
                        />
                      </div>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto custom-scroll">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                        {filteredPlaces.length === 0 ? (
                          <div className="col-span-full text-center py-12 text-xs text-muted-foreground italic">
                            No se encontraron lugares de reemplazo.
                          </div>
                        ) : (
                          filteredPlaces.map((p) => (
                            <Card
                              key={p.id}
                              onClick={() => handleSelectAlternative(p.id)}
                              className="cursor-pointer border border-border/80 hover:border-primary/50 hover:bg-primary/[0.01] hover:-translate-y-0.5 transition-all duration-200 p-3 flex flex-col justify-between min-h-[110px] shadow-[0_1px_2px_rgba(0,0,0,0.01)] bg-background"
                            >
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-bold text-xs text-foreground leading-tight truncate max-w-[155px]">
                                    {p.name}
                                  </h4>
                                  <Badge variant="secondary" className="text-[9px] py-0 h-4 px-1.5 font-mono font-bold text-primary bg-primary/10 border-none shrink-0">
                                    {p.distance.toFixed(1)} km
                                  </Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground line-clamp-1">{p.address}</p>
                              </div>

                              <div className="flex items-center justify-between text-[10px] pt-2 border-t border-border/40 mt-3">
                                <span className="text-[9px] uppercase tracking-wider font-extrabold text-muted-foreground/80">
                                  {p.category}
                                </span>
                                <span className="text-primary font-bold">
                                  {p.priceRange ? p.priceRange.split(' por')[0] : 'Gratis'}
                                </span>
                              </div>
                            </Card>
                          ))
                        )}
                      </div>
                    </div>
                  </Card>
                ) : (
                  /* Map + Detail panels side-by-side */
                  <>
                    <Card className="overflow-hidden border-border bg-card">
                      <div className="p-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-xs font-semibold truncate">
                            Mapa de la Sabana · Día {selectedDay} · {dayPlan?.weekday}
                          </span>
                        </div>
                        {selectedStepId && (
                          <button
                            onClick={() => useTravelStore.getState().clearStepSelection()}
                            className="text-[10px] text-muted-foreground hover:text-foreground shrink-0"
                          >
                            ✕ Volver al itinerario
                          </button>
                        )}
                      </div>
                      <div className="p-2.5 h-[460px]">
                        <TravelMap
                          highlightedPlaceIds={highlightedPlaceIds}
                          height="100%"
                          overrideSelectedPlaceId={stepPlaceForMap?.id}
                        />
                      </div>
                    </Card>

                    {/* Detail panel for Places (shows on first click) */}
                    {showPlaceDetailPanel && selectedPlace && (
                      <PlaceDetail
                        place={selectedPlace}
                        onClose={() => useTravelStore.getState().setSelectedPlaceId(null)}
                      />
                    )}

                    {/* Detail panel for Routes (shows on first click) */}
                    {showRouteDetailPanel && selectedStep && (
                      <RouteDetail
                        step={selectedStep}
                        stepIdx={selectedStepIdx}
                        onSelectTransport={handleSelectTransportMode}
                        onClose={() => useTravelStore.getState().clearStepSelection()}
                      />
                    )}

                    {/* Detail panel for Grouped Activities (Requested) */}
                    {showGroupDetailPanel && selectedGroupNode && (
                      <Card className="border-border shadow-lg animate-fade-in-up bg-card overflow-hidden">
                        <CardHeader className="pb-3 bg-emerald-500/[0.02] border-b border-border">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 flex items-center gap-1">
                                📦 Resumen de Grupo
                              </span>
                              <CardTitle className="text-base font-bold mt-1 text-[#2D6A4F]">
                                Agenda Peatonal de la Zona
                              </CardTitle>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={() => useTravelStore.getState().clearStepSelection()}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="p-4 space-y-4 max-h-[300px] overflow-y-auto custom-scroll">
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            Actividades continuas en el mismo sector. Planificadas para recorrerse a pie sin necesidad de transporte público o privado.
                          </p>
                          <div className="space-y-4 pt-1">
                            {selectedGroupNode.map((act) => {
                              const placeObj = act.placeId ? getPlaceById(act.placeId) : null;
                              return (
                                <div key={act.id} className="relative pl-5 border-l-2 border-emerald-500/30 last:border-l-0 pb-1">
                                  <span className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-[#2D6A4F] border border-white" />
                                  <div className="text-[10px] font-mono text-[#2D6A4F] font-bold">{act.time}</div>
                                  <h4 className="text-xs font-bold text-foreground mt-0.5">{act.activity}</h4>
                                  {placeObj && (
                                    <div className="text-[10.5px] text-muted-foreground mt-0.5 flex items-center gap-1">
                                      <MapPin className="h-3 w-3 text-primary shrink-0" />
                                      <span className="truncate">{placeObj.name} · {placeObj.address}</span>
                                    </div>
                                  )}
                                  {act.notes && (
                                    <p className="text-[10px] text-muted-foreground/80 italic mt-1 bg-muted/40 p-1.5 rounded-md leading-normal">
                                      "{act.notes}"
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* EXPLORAR Guía VIEW */}
        {mainView === 'explorar' && <ExplorarList />}

        {/* MI PLAN VIEW */}
        {mainView === 'mi-plan' && <PlanEditor />}

        {/* INFO VIEW */}
        {mainView === 'info' && <InfoPanel />}
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-card mt-8">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Mountain className="h-3 w-3 text-[#2D6A4F]" />
              <span>Plan maestro de la Sabana · Bogotá 2026</span>
            </div>
            <div>4°43′N · 74°04′W · 2,640 m s.n.m.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
