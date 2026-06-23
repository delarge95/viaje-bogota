'use client';

import { useMemo } from 'react';
import { dayPlans, resolvePlace, places } from '@/lib/travel-data';
import { useTravelStore } from '@/lib/travel-store';
import dynamic from 'next/dynamic';
import PlaceDetail from '@/components/place-detail';
import ItineraryTimeline from '@/components/itinerary-timeline';
import LugaresList from '@/components/lugares-list';
import RestaurantList from '@/components/restaurant-list';
import ActividadesList from '@/components/actividades-list';
import InfoPanel from '@/components/info-panel';
import PlanEditor from '@/components/plan-editor';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mountain, MapPin, Utensils, Info, CalendarDays, Sparkles, Edit3 } from 'lucide-react';
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

type MainView = 'lugares' | 'restaurantes' | 'actividades' | 'info' | 'mi-plan' | 'itinerario';

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

  const dayPlan = useMemo(() => dayPlans.find((d) => d.day === selectedDay), [selectedDay]);
  const activeCustomPlan = useMemo(() => customPlans.find((p) => p.id === activeCustomPlanId), [customPlans, activeCustomPlanId]);

  // Place IDs for this day (for map highlighting)
  const highlightedPlaceIds = useMemo(() => {
    if (!dayPlan) return [];
    const ids = new Set<string>();
    dayPlan.plan.forEach((step) => {
      [step.placeId, step.fromPlaceId, step.toPlaceId].forEach((pid) => {
        if (pid) ids.add(pid);
      });
    });
    dayPlan.alternatives?.forEach((alt) => alt.placeIds.forEach((id) => ids.add(id)));
    return Array.from(ids);
  }, [dayPlan]);

  const selectedPlace = selectedPlaceId ? resolvePlace(selectedPlaceId, selectedAlternatives) : null;

  // When a step is selected (first click), center the map on that step's place
  // even if selectedPlaceId is not set (first click shows location only)
  const stepPlaceForMap = useMemo(() => {
    if (!selectedStepId || !dayPlan) return null;
    const step = dayPlan.plan.find((s) => s.id === selectedStepId);
    if (!step) return null;
    const placeId = step.placeId || step.toPlaceId || step.fromPlaceId;
    if (!placeId) return null;
    return resolvePlace(placeId, selectedAlternatives);
  }, [selectedStepId, dayPlan, selectedAlternatives]);

  // Show detail panel when: a place is selected AND step was clicked at least twice
  const showDetailPanel = selectedPlace && mainView === 'itinerario' && stepClickCount >= 2;

  const mainTabs: { id: MainView; label: string; icon: typeof MapPin }[] = [
    { id: 'itinerario', label: 'Itinerario', icon: CalendarDays },
    { id: 'lugares', label: 'Lugares', icon: MapPin },
    { id: 'restaurantes', label: 'Restaurantes', icon: Utensils },
    { id: 'actividades', label: 'Actividades', icon: Sparkles },
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

            {/* Itinerary + Map grid */}
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

              {/* Right: Map + detail */}
              <div className="lg:col-span-7 space-y-3">
                {/* Map */}
                <Card className="overflow-hidden border-border">
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
              </div>
            </div>
          </div>
        )}

        {/* LUGARES VIEW */}
        {mainView === 'lugares' && <LugaresList />}

        {/* RESTAURANTES VIEW */}
        {mainView === 'restaurantes' && <RestaurantList />}

        {/* ACTIVIDADES VIEW */}
        {mainView === 'actividades' && <ActividadesList />}

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
