import { create } from "zustand";

type State = {
  isOpen: boolean;
};

type Actions = {
  closeModal: () => void;
  openModal: () => void;
  handleChangeEditReserve: () => void;
};

export const useDashboardEditReserveModalStore = create<State & Actions>(
  (set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
    handleChangeEditReserve: () => set((state) => ({ isOpen: !state.isOpen })),
  })
);
