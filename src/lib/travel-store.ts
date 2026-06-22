'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TravelState {
  selectedDay: number;
  selectedAlternatives: Record<string, string>; // category -> placeId
  selectedPlaceId: string | null;
  selectedView: 'itinerario' | 'mapa' | 'restaurantes' | 'info';
  setSelectedDay: (day: number) => void;
  setSelectedAlternative: (category: string, placeId: string) => void;
  setSelectedPlaceId: (placeId: string | null) => void;
  setSelectedView: (view: 'itinerario' | 'mapa' | 'restaurantes' | 'info') => void;
}

export const useTravelStore = create<TravelState>()(
  persist(
    (set) => ({
      selectedDay: 1,
      selectedAlternatives: {},
      selectedPlaceId: null,
      selectedView: 'itinerario',
      setSelectedDay: (day) => set({ selectedDay: day }),
      setSelectedAlternative: (category, placeId) =>
        set((state) => ({
          selectedAlternatives: { ...state.selectedAlternatives, [category]: placeId },
        })),
      setSelectedPlaceId: (placeId) => set({ selectedPlaceId: placeId }),
      setSelectedView: (view) => set({ selectedView: view }),
    }),
    {
      name: 'bogota-travel-store',
    }
  )
);
