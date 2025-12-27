import { create } from "zustand";

type KPIDetailType = "caja_fisica" | "ingresos_totales" | "por_cobrar" | "egresos";

interface FinancialDetailsModalStore {
    isOpen: boolean;
    detailType: KPIDetailType | null;
    handleOpen: (type: KPIDetailType) => void;
    handleClose: () => void;
}

export const useFinancialDetailsModalStore = create<FinancialDetailsModalStore>((set) => ({
    isOpen: false,
    detailType: null,
    handleOpen: (type) => set({ isOpen: true, detailType: type }),
    handleClose: () => set({ isOpen: false, detailType: null }),
}));
