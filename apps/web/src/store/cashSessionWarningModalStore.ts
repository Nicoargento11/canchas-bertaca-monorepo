import { create } from 'zustand';

interface CashSessionWarningModalStore {
    isOpen: boolean;
    reserveData: any | null;
    handleOpen: (data: any) => void;
    handleClose: () => void;
}

export const useCashSessionWarningModalStore = create<CashSessionWarningModalStore>((set) => ({
    isOpen: false,
    reserveData: null,
    handleOpen: (data) => set({ isOpen: true, reserveData: data }),
    handleClose: () => set({ isOpen: false, reserveData: null }),
}));
