import { create } from "zustand";

type State = {
  isOpen: boolean;
};

type Actions = {
  closeModal: () => void;
  openModal: () => void;
  handleChangeReserve: () => void;
};

export const useDashboardReserveModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  handleChangeReserve: () => set((state) => ({ isOpen: !state.isOpen })),
}));
