// stores/payments-store.ts
import { Payment } from "@/services/payment/payment";
import { create } from "zustand";

interface PaymentsState {
  payments: Payment[];
  initialized: boolean;

  setPayments: (payments: Payment[]) => void;
  addPayment: (payment: Payment) => void;
  updatePayment: (id: string, updatedPayment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;

  initializePayments: (productSales: Payment[]) => void;
}

export const usePaymentsStore = create<PaymentsState>((set) => ({
  payments: [],
  initialized: false,

  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
  updatePayment: (id, updatedPayment) =>
    set((state) => ({
      payments: state.payments.map((payment) =>
        payment.id === id ? { ...payment, ...updatedPayment } : payment
      ),
    })),
  deletePayment: (id) =>
    set((state) => ({ payments: state.payments.filter((payment) => payment.id !== id) })),
  initializePayments: (payments) =>
    set((state) => {
      return { payments, initialized: true };
    }),
}));
