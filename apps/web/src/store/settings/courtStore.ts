// stores/court-store.ts
import { Court } from "@/services/court/court";
import { create } from "zustand";

interface CourtState {
  courts: Court[];
  initialized: boolean;

  initializeCourts: (courts: Court[]) => void;
  setCourts: (courts: Court[]) => void;
  addCourt: (court: Court) => void;
  updateCourt: (id: string, updatedCourt: Partial<Court>) => void;
  deleteCourt: (id: string) => void;
  toggleCourtStatus: (id: string) => void;
}

export const useCourtStore = create<CourtState>((set) => ({
  courts: [],
  initialized: false,

  initializeCourts: (courts) =>
    set((state) => ({
      courts: state.initialized ? state.courts : courts,
      initialized: true,
    })),

  setCourts: (courts) => set({ courts }),

  addCourt: (court) =>
    set((state) => ({
      courts: [...state.courts, court],
    })),

  updateCourt: (id, updatedCourt) =>
    set((state) => ({
      courts: state.courts.map((court) =>
        court.id === id ? { ...court, ...updatedCourt } : court
      ),
    })),

  deleteCourt: (id) =>
    set((state) => ({
      courts: state.courts.filter((court) => court.id !== id),
    })),

  toggleCourtStatus: (id) =>
    set((state) => ({
      courts: state.courts.map((court) =>
        court.id === id ? { ...court, isActive: !court.isActive } : court
      ),
    })),
}));
