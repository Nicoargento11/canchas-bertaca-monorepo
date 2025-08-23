import { create } from "zustand";

type State = {
  isOpen: boolean;
};

type Actions = {
  closeModal: () => void;
  openModal: () => void;
  handleChangeCompleteReserve: () => void;
};

export const useDashboardCompleteReserveModalStore = create<State & Actions>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  handleChangeCompleteReserve: () => set((state) => ({ isOpen: !state.isOpen })),
}));
