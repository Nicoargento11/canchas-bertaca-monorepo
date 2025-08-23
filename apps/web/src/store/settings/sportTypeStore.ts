// stores/sport-type-store.ts
import { SportType } from "@/services/sport-types/sport-types";
import { create } from "zustand";

interface SportTypeState {
  sportTypes: SportType[];
  initialized: boolean;

  initializeSportTypes: (sportTypes: SportType[]) => void;
  setSportTypes: (sportTypes: SportType[]) => void;
  addSportType: (sportType: SportType) => void;
  updateSportType: (id: string, updatedSportType: Partial<SportType>) => void;
  deleteSportType: (id: string) => void;
  toggleSportTypeStatus: (id: string) => void;
}

export const useSportTypeStore = create<SportTypeState>((set) => ({
  sportTypes: [],
  initialized: false,

  initializeSportTypes: (sportTypes) =>
    set((state) => ({
      sportTypes: state.initialized ? state.sportTypes : sportTypes,
      initialized: true,
    })),

  setSportTypes: (sportTypes) => set({ sportTypes }),

  addSportType: (sportType) =>
    set((state) => ({
      sportTypes: [...state.sportTypes, sportType],
    })),

  updateSportType: (id, updatedSportType) =>
    set((state) => ({
      sportTypes: state.sportTypes.map((type) =>
        type.id === id ? { ...type, ...updatedSportType } : type
      ),
    })),

  deleteSportType: (id) =>
    set((state) => ({
      sportTypes: state.sportTypes.filter((type) => type.id !== id),
    })),

  toggleSportTypeStatus: (id) =>
    set((state) => ({
      sportTypes: state.sportTypes.map((type) =>
        type.id === id ? { ...type, isActive: !type.isActive } : type
      ),
    })),
}));
