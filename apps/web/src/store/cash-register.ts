// stores/cash-register-store.ts
import { create } from "zustand";
import { CashRegister } from "@/services/cash-register/cash-register";
import { CashSession } from "@/services/cash-session/cash-session";

type CashRegisterStore = {
  registers: CashRegister[];
  activeRegister: CashRegister | null;
  activeSession: CashSession | null;
  setRegisters: (registers: CashRegister[]) => void;
  setActiveRegister: (register: CashRegister | null) => void;
  setActiveSession: (session: CashSession | null) => void;
  clearCashRegister: () => void;

  // fetchRegisters: (complexId: string) => Promise<void>;
  // fetchActiveSession: (cashRegisterId: string) => Promise<void>;
};

export const useCashRegisterStore = create<CashRegisterStore>()((set, get) => ({
  registers: [],
  activeRegister: null,
  activeSession: null,
  setRegisters: (registers) => set({ registers }),
  setActiveRegister: (activeRegister) => set({ activeRegister }),
  setActiveSession: (activeSession) => set({ activeSession }),
  clearCashRegister: () => set({ activeRegister: null, activeSession: null }),
}));
