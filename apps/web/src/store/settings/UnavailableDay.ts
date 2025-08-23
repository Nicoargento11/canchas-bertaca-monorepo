// stores/unavailable-day-store.ts
import { UnavailableDay } from "@/services/unavailable-day/unavailable-day";
import { create } from "zustand";

interface UnavailableDayState {
  unavailableDays: UnavailableDay[];
  initialized: boolean;

  initializeUnavailableDays: (unavailableDays: UnavailableDay[]) => void;
  setUnavailableDays: (unavailableDays: UnavailableDay[]) => void;
  addUnavailableDay: (unavailableDay: UnavailableDay | UnavailableDay[]) => void;
  updateUnavailableDay: (id: string, updatedUnavailableDay: Partial<UnavailableDay>) => void;
  deleteUnavailableDay: (id: string) => void;
}

export const useUnavailableDayStore = create<UnavailableDayState>((set) => ({
  unavailableDays: [],
  initialized: false,

  initializeUnavailableDays: (unavailableDays) =>
    set((state) => ({
      unavailableDays: state.initialized ? state.unavailableDays : unavailableDays,
      initialized: true,
    })),

  setUnavailableDays: (unavailableDays) => set({ unavailableDays }),

  addUnavailableDay: (dayOrDays) =>
    set((state) => ({
      unavailableDays: [
        ...state.unavailableDays,
        ...(Array.isArray(dayOrDays) ? dayOrDays : [dayOrDays]),
      ],
    })),

  updateUnavailableDay: (id, updatedUnavailableDay) =>
    set((state) => ({
      unavailableDays: state.unavailableDays.map((day) =>
        day.id === id ? { ...day, ...updatedUnavailableDay } : day
      ),
    })),

  deleteUnavailableDay: (id) =>
    set((state) => ({
      unavailableDays: state.unavailableDays.filter((day) => day.id !== id),
    })),
}));
