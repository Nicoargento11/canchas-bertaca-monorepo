// stores/fixed-reserve-store.ts
import { FixedReserve } from "@/services/fixed-reserve/fixed-reserve";
import { create } from "zustand";

interface FixedReserveState {
  fixedReserves: FixedReserve[];
  initialized: boolean;

  initializeFixedReserves: (fixedReserves: FixedReserve[]) => void;
  setFixedReserves: (fixedReserves: FixedReserve[]) => void;
  addFixedReserve: (fixedReserve: FixedReserve) => void;
  updateFixedReserve: (id: string, updatedFixedReserve: Partial<FixedReserve>) => void;
  deleteFixedReserve: (id: string) => void;
  toggleFixedReserveStatus: (id: string) => void;
}

export const useFixedReserveStore = create<FixedReserveState>((set) => ({
  fixedReserves: [],
  initialized: false,

  initializeFixedReserves: (fixedReserves) =>
    set((state) => ({
      fixedReserves: state.initialized ? state.fixedReserves : fixedReserves,
      initialized: true,
    })),

  setFixedReserves: (fixedReserves) => set({ fixedReserves }),

  addFixedReserve: (fixedReserve) =>
    set((state) => ({
      fixedReserves: [...state.fixedReserves, fixedReserve],
    })),

  updateFixedReserve: (id, updatedFixedReserve) =>
    set((state) => ({
      fixedReserves: state.fixedReserves.map((reserve) =>
        reserve.id === id ? { ...reserve, ...updatedFixedReserve } : reserve
      ),
    })),

  deleteFixedReserve: (id) =>
    set((state) => ({
      fixedReserves: state.fixedReserves.filter((reserve) => reserve.id !== id),
    })),

  toggleFixedReserveStatus: (id) =>
    set((state) => ({
      fixedReserves: state.fixedReserves.map((reserve) =>
        reserve.id === id ? { ...reserve, isActive: !reserve.isActive } : reserve
      ),
    })),
}));
