'use client';

import { useState, useMemo } from 'react';
import {
  dayPlans,
  resolvePlace,
  places,
  getPlaceById,
  getDistance,
  reconstructSteps
} from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import dynamic from 'next/dynamic';
import PlaceDetail from '@/components/place-detail';
import ItineraryTimeline from '@/components/itinerary-timeline';
import ExplorarList from '@/components/explorar-list';
import InfoPanel from '@/components/info-panel';
import PlanEditor from '@/components/plan-editor';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mountain, MapPin, Info, CalendarDays, Edit3, Search, X, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const TravelMap = dynamic(() => import('@/components/travel-map'), {
  ssr: false,
  loading: () => (
    <div className="h-full min-h-[400px] w-full bg-muted/30 rounded-xl flex items-center justify-center text-sm text-muted-foreground">
      <div className="text-center">
        <div className="animate-pulse h-8 w-8 mx-auto mb-2 rounded-full bg-primary/30" />
        Cargando mapa...
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

  // When a step is selected (first click), center the map on that step's place
  const stepPlaceForMap = useMemo(() => {
    if (!selectedStepId || !dayPlan) return null;
    const stepsToUse = activeCustomPlan ? activeCustomPlan.steps : dayPlan.plan;
    const step = stepsToUse.find((s) => s.id === selectedStepId);
    if (!step) return null;
    const placeId = step.placeId || step.toPlaceId || step.fromPlaceId;
    if (!placeId) return null;
    return resolvePlace(placeId, selectedAlternatives);
  }, [selectedStepId, dayPlan, activeCustomPlan, selectedAlternatives]);

  // Show detail panel when: a place is selected AND step was clicked at least twice
  const showDetailPanel = selectedPlace && mainView === 'itinerario' && stepClickCount >= 2;

  // replacement calculations
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
    { id: 'explorar', label: 'Explorar', icon: Search },
    { id: 'mi-plan', label: 'Mi Plan', icon: Edit3 },
    { id: 'info', label: 'Info', icon: Info },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* HEADER - Minimalist */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm">
                <Mountain className="h-4.5 w-4.5" />
              </div>
              <div>
                <h1 className="text-base font-bold leading-tight">Bogotá · 8 días</h1>
                <p className="text-[10px] text-muted-foreground leading-tight">15-22 julio 2026</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="font-mono">{places.length} lugares</span>
              <span>·</span>
              <span className="font-mono">{places.filter(p => p.category === 'restaurante').length} restaurantes</span>
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
                  onClick={() => setMainView(tab.id)}
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
                    <Badge variant="secondary" className="text-[9px] h-4 px-1 ml-0.5">
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
        {/* ITINERARIO VIEW: day selector + itinerary + map */}
        {mainView === 'itinerario' && (
          <div className="space-y-4">
            {/* Day selector */}
            <div className="flex items-center gap-2 overflow-x-auto custom-scroll pb-1">
              <span className="text-xs font-semibold text-muted-foreground shrink-0 mr-1">Día:</span>
              {dayPlans.map((day) => (
                <button
                  key={day.day}
                  onClick={() => setSelectedDay(day.day)}
                  className={cn(
                    'flex flex-col items-center px-3 py-1.5 rounded-lg border text-center transition-all shrink-0 min-w-[60px]',
                    selectedDay === day.day
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-card hover:border-primary/40'
                  )}
                >
                  <span className="text-[10px] uppercase tracking-wide opacity-80">{day.weekday.slice(0, 3)}</span>
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

              {/* Right: Map + details OR Replacement Panel */}
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
                  /* Map */
                  <>
                    <Card className="overflow-hidden border-border bg-card">
                      <div className="p-2.5 border-b border-border bg-muted/30 flex items-center justify-between">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="text-xs font-semibold truncate">
                            Día {selectedDay} · {dayPlan?.weekday}
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
                      <div className="p-2.5 h-[480px]">
                        <TravelMap
                          highlightedPlaceIds={highlightedPlaceIds}
                          height="100%"
                          overrideSelectedPlaceId={stepPlaceForMap?.id}
                        />
                      </div>
                    </Card>

                    {/* Detail panel (shows on 2nd click) */}
                    {showDetailPanel && selectedPlace && (
                      <PlaceDetail
                        place={selectedPlace}
                        onClose={() => useTravelStore.getState().setSelectedPlaceId(null)}
                      />
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
              <Mountain className="h-3 w-3 text-primary" />
              <span>Plan maestro · Bogotá 2026</span>
            </div>
            <div>4°43′N · 74°04′W · 2,640 m s.n.m.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
