import { ReserveData } from "@/app/(protected)/_components/dashboard/dashboard/biTableDay";
import { getReserveById, Reserve } from "@/services/reserve/reserve";
import { create } from "zustand";

type State = {
  createReserve: ReserveData | undefined;
  reserve: Reserve | null;
  date: Date | null;
};

type Actions = {
  getReserveById: (reserveId: string) => void;
  setDate: (date: Date) => void;
  setCreateReserve: (reserveData: ReserveData) => void;
  setReserve: (reserve: Reserve | null) => void;
};

export const useDashboardDataStore = create<State & Actions>((set) => ({
  reserve: null,
  date: null,
  createReserve: undefined,
  getReserveById: async (reserveId: string) => {
    const { data: reserve } = await getReserveById(reserveId);
    set({ reserve });
  },
  setDate: (date: Date) => set(() => ({ date })),
  setCreateReserve: (createReserve: ReserveData) => set({ createReserve }),
  setReserve: (reserve: Reserve | null) => set({ reserve }),
}));
