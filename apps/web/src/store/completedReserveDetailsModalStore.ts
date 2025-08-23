import { create } from "zustand";

type State = {
  isOpen: boolean;
};

type Actions = {
  closeModal: () => void;
  openModal: () => void;
  handleChangeCompletedDetails: () => void;
};

export const useCompletedReserveDetailsModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  handleChangeCompletedDetails: () => set((state) => ({ isOpen: !state.isOpen })),
}));
