import { create } from "zustand";

type State = {
  isOpen: boolean;
};

type Actions = {
  closeModal: () => void;
  openModal: () => void;
  handleChangeDetails: () => void;
};

export const useDashboardDetailsModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  handleChangeDetails: () => set((state) => ({ isOpen: !state.isOpen })),
}));
