import { ReserveData } from "@/app/(protected)/_components/dashboard/dashboard/biTableDay";
import { getReserveByIdFetch, Reserve } from "@/services/reserves/reserves";
import { create } from "zustand";

type State = {
  createReserve: ReserveData | undefined;
  reserve: Reserve | null;
  date: Date;
};

type Actions = {
  getReserveById: (reserveId: string) => void;
  setDate: (date: Date) => void;
  setCreateReserve: (reserveData: ReserveData) => void;
};

export const useDashboardDataStore = create<State & Actions>((set) => ({
  reserve: null,
  date: new Date(),
  createReserve: undefined,
  getReserveById: async (reserveId: string) => {
    const reserve = await getReserveByIdFetch(reserveId);
    set({ reserve });
  },
  setDate: (date: Date) => set(() => ({ date })),
  setCreateReserve: (createReserve: ReserveData) => set({ createReserve }),
}));
