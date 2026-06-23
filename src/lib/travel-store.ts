'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TravelState {
  selectedDay: number;
  selectedAlternatives: Record<string, string>; // category -> placeId
  selectedPlaceId: string | null;
  selectedStepId: string | null; // active step in itinerary
  selectedView: 'itinerario' | 'mapa' | 'restaurantes' | 'info';
  // Route display state
  routeOriginId: string | null;
  routeDestinationId: string | null;
  routeMode: 'driving' | 'transit' | 'walking' | 'bicycling';
  setSelectedDay: (day: number) => void;
  setSelectedAlternative: (category: string, placeId: string) => void;
  setSelectedPlaceId: (placeId: string | null) => void;
  setSelectedStepId: (stepId: string | null) => void;
  setSelectedView: (view: 'itinerario' | 'mapa' | 'restaurantes' | 'info') => void;
  setRoute: (originId: string | null, destinationId: string | null, mode: 'driving' | 'transit' | 'walking' | 'bicycling') => void;
  clearRoute: () => void;
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set) => ({
      selectedDay: 1,
      selectedAlternatives: {},
      selectedPlaceId: null,
      selectedStepId: null,
      selectedView: 'itinerario',
      routeOriginId: null,
      routeDestinationId: null,
      routeMode: 'driving',
      setSelectedDay: (day) => set({ selectedDay: day, selectedStepId: null }),
      setSelectedAlternative: (category, placeId) =>
        set((state) => ({
          selectedAlternatives: { ...state.selectedAlternatives, [category]: placeId },
        })),
      setSelectedPlaceId: (placeId) => set({ selectedPlaceId: placeId }),
      setSelectedStepId: (stepId) => set({ selectedStepId: stepId }),
      setSelectedView: (view) => set({ selectedView: view }),
      setRoute: (originId, destinationId, mode) =>
        set({ routeOriginId: originId, routeDestinationId: destinationId, routeMode: mode }),
      clearRoute: () => set({ routeOriginId: null, routeDestinationId: null }),
    }),
    {
      name: 'bogota-travel-store-v2',
      partialize: (state) => ({
        selectedDay: state.selectedDay,
        selectedAlternatives: state.selectedAlternatives,
        selectedView: state.selectedView,
      }),
    }
  )
);
