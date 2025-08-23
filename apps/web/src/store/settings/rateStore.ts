// stores/rate-store.ts
import { Rate } from "@/services/rate/rate";
import { create } from "zustand";

interface RateState {
  rates: Rate[];
  initialized: boolean;

  initializeRates: (rates: Rate[]) => void;
  setRates: (rates: Rate[]) => void;
  addRate: (rate: Rate) => void;
  updateRate: (id: string, updatedRate: Partial<Rate>) => void;
  deleteRate: (id: string) => void;
}

export const useRateStore = create<RateState>((set) => ({
  rates: [],
  initialized: false,

  initializeRates: (rates) =>
    set((state) => ({
      rates: state.initialized ? state.rates : rates,
      initialized: true,
    })),

  setRates: (rates) => set({ rates }),

  addRate: (rate) =>
    set((state) => ({
      rates: [...state.rates, rate],
    })),

  updateRate: (id, updatedRate) =>
    set((state) => ({
      rates: state.rates.map((rate) => (rate.id === id ? { ...rate, ...updatedRate } : rate)),
    })),

  deleteRate: (id) =>
    set((state) => ({
      rates: state.rates.filter((rate) => rate.id !== id),
    })),
}));
