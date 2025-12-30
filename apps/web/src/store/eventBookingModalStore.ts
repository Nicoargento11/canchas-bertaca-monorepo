import { create } from "zustand";

interface EventBookingModalStore {
    isOpen: boolean;
    onOpen: () => void;
    onClose: () => void;
}

export const useEventBookingModalStore = create<EventBookingModalStore>((set) => ({
    isOpen: false,
    onOpen: () => set({ isOpen: true }),
    onClose: () => set({ isOpen: false }),
}));
