'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CustomPlan } from './travel-data';

type MainView = 'explorar' | 'info' | 'mi-plan' | 'itinerario';

interface TravelState {
  // Navigation
  mainView: MainView;
  selectedDay: number;
  // Itinerary interaction
  selectedStepId: string | null;
  stepClickCount: number; // 0 = no selection, 1 = show route, 2 = show detail
  // Place selection
  selectedPlaceId: string | null;
  // Restaurant alternatives
  selectedAlternatives: Record<string, string>; // category -> placeId
  // Transport alternatives per step
  selectedTransport: Record<string, string>; // stepId -> transportAltId
  // Route display
  routeOriginId: string | null;
  routeDestinationId: string | null;
  routeMode: 'driving' | 'transit' | 'walking' | 'bicycling';
  // Custom plans
  customPlans: CustomPlan[];
  activeCustomPlanId: string | null;
  activeReplacementStepId: string | null;

  // Actions
  setMainView: (view: MainView) => void;
  setSelectedDay: (day: number) => void;
  selectStep: (stepId: string) => void;
  clearStepSelection: () => void;
  setSelectedPlaceId: (placeId: string | null) => void;
  setSelectedAlternative: (category: string, placeId: string) => void;
  setSelectedTransport: (stepId: string, transportAltId: string) => void;
  setRoute: (originId: string | null, destinationId: string | null, mode: 'driving' | 'transit' | 'walking' | 'bicycling') => void;
  clearRoute: () => void;
  // Custom plan actions
  addCustomPlan: (plan: CustomPlan) => void;
  updateCustomPlan: (planId: string, updates: Partial<CustomPlan>) => void;
  deleteCustomPlan: (planId: string) => void;
  setActiveCustomPlan: (planId: string | null) => void;
  setActiveReplacementStepId: (stepId: string | null) => void;
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set, get) => ({
      mainView: 'itinerario',
      selectedDay: 1,
      selectedStepId: null,
      stepClickCount: 0,
      selectedPlaceId: null,
      selectedAlternatives: {},
      selectedTransport: {},
      routeOriginId: null,
      routeDestinationId: null,
      routeMode: 'driving',
      customPlans: [],
      activeCustomPlanId: null,
      activeReplacementStepId: null,

      setMainView: (view) => set({ mainView: view }),
      setSelectedDay: (day) => set({ selectedDay: day, selectedStepId: null, stepClickCount: 0, routeOriginId: null, routeDestinationId: null, activeReplacementStepId: null }),
      selectStep: (stepId) => {
        const state = get();
        if (state.selectedStepId === stepId) {
          set({ stepClickCount: state.stepClickCount + 1 });
        } else {
          set({ selectedStepId: stepId, stepClickCount: 1 });
        }
      },
      clearStepSelection: () => set({ selectedStepId: null, stepClickCount: 0, routeOriginId: null, routeDestinationId: null }),
      setSelectedPlaceId: (placeId) => set({ selectedPlaceId: placeId }),
      setSelectedAlternative: (category, placeId) =>
        set((state) => ({
          selectedAlternatives: { ...state.selectedAlternatives, [category]: placeId },
        })),
      setSelectedTransport: (stepId, transportAltId) =>
        set((state) => ({
          selectedTransport: { ...state.selectedTransport, [stepId]: transportAltId },
        })),
      setRoute: (originId, destinationId, mode) =>
        set({ routeOriginId: originId, routeDestinationId: destinationId, routeMode: mode }),
      clearRoute: () => set({ routeOriginId: null, routeDestinationId: null }),
      addCustomPlan: (plan) =>
        set((state) => ({ customPlans: [...state.customPlans, plan] })),
      updateCustomPlan: (planId, updates) =>
        set((state) => ({
          customPlans: state.customPlans.map((p) =>
            p.id === planId ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        })),
      deleteCustomPlan: (planId) =>
        set((state) => ({
          customPlans: state.customPlans.filter((p) => p.id !== planId),
          activeCustomPlanId: state.activeCustomPlanId === planId ? null : state.activeCustomPlanId,
        })),
      setActiveCustomPlan: (planId) => set({ activeCustomPlanId: planId }),
      setActiveReplacementStepId: (stepId) => set({ activeReplacementStepId: stepId }),
    }),
    {
      name: 'bogota-travel-store-v3',
      partialize: (state) => ({
        selectedDay: state.selectedDay,
        selectedAlternatives: state.selectedAlternatives,
        selectedTransport: state.selectedTransport,
        customPlans: state.customPlans,
      }),
    }
  )
);
