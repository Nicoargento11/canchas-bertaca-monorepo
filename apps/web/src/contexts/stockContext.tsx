// contexts/PaymentCourtContext.tsx
"use client";

import React, { createContext, useContext, useState } from "react";

interface Payment {
  amount: number;
  method: string;
  time: string;
}

interface Consumition {
  product: string;
  quantity: number;
  price: number;
  time: string;
}

interface CourtPayment {
  id: string;
  court: number;
  clientName: string;
  paidAmount: number;
  consumitionAmount: number;
  balance: number;
  completed: boolean;
  payments: Payment[];
  consumitions: Consumition[];
}

interface SchedulePayment {
  schedule: string;
  court: (CourtPayment | null)[];
}

interface PaymentModalState {
  isOpen: boolean;
  selectedPayment: CourtPayment | null;
  isNew: boolean;
}

interface PaymentCourtContextType {
  date: Date | undefined;
  setDate: (date: Date | undefined) => void;
  paymentsByDay: SchedulePayment[];
  setPaymentsByDay: (payments: SchedulePayment[]) => void;
  modalState: PaymentModalState;
  openPaymentModal: (payment: CourtPayment | null, isNew?: boolean) => void;
  closePaymentModal: () => void;
  completePayment: (paymentId: string) => void;
  addPayment: (payment: Payment) => void;
  addConsumition: (consumition: Consumition) => void;
  removePayment: (index: number) => void;
  removeConsumition: (index: number) => void;
  savePayment: (payment: CourtPayment) => void;
}

const PaymentCourtContext = createContext<PaymentCourtContextType | undefined>(
  undefined
);

export const PaymentCourtProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [paymentsByDay, setPaymentsByDay] =
    useState<SchedulePayment[]>(mockPaymentsData);
  const [modalState, setModalState] = useState<PaymentModalState>({
    isOpen: false,
    selectedPayment: null,
    isNew: false,
  });

  const openPaymentModal = (payment: CourtPayment | null, isNew = false) => {
    setModalState({
      isOpen: true,
      selectedPayment: payment,
      isNew,
    });
  };

  const closePaymentModal = () => {
    setModalState({
      isOpen: false,
      selectedPayment: null,
      isNew: false,
    });
  };

  const completePayment = (paymentId: string) => {
    setPaymentsByDay((prev) =>
      prev.map((schedule) => ({
        ...schedule,
        court: schedule.court.map((courtPayment) => {
          if (courtPayment?.id === paymentId) {
            return { ...courtPayment, completed: true };
          }
          return courtPayment;
        }),
      }))
    );
  };

  const addPayment = (payment: Payment) => {
    if (!modalState.selectedPayment) return;

    setModalState((prev) => ({
      ...prev,
      selectedPayment: {
        ...prev.selectedPayment!,
        payments: [...prev.selectedPayment!.payments, payment],
        paidAmount: prev.selectedPayment!.paidAmount + payment.amount,
        balance:
          prev.selectedPayment!.paidAmount +
          payment.amount -
          prev.selectedPayment!.consumitionAmount,
      },
    }));
  };

  const addConsumition = (consumition: Consumition) => {
    if (!modalState.selectedPayment) return;

    const consumitionAmount = consumition.quantity * consumition.price;

    setModalState((prev) => ({
      ...prev,
      selectedPayment: {
        ...prev.selectedPayment!,
        consumitions: [...prev.selectedPayment!.consumitions, consumition],
        consumitionAmount:
          prev.selectedPayment!.consumitionAmount + consumitionAmount,
        balance:
          prev.selectedPayment!.paidAmount -
          (prev.selectedPayment!.consumitionAmount + consumitionAmount),
      },
    }));
  };

  const removePayment = (index: number) => {
    if (!modalState.selectedPayment) return;

    const payment = modalState.selectedPayment.payments[index];
    setModalState((prev) => ({
      ...prev,
      selectedPayment: {
        ...prev.selectedPayment!,
        payments: prev.selectedPayment!.payments.filter((_, i) => i !== index),
        paidAmount: prev.selectedPayment!.paidAmount - payment.amount,
        balance: prev.selectedPayment!.balance - payment.amount,
      },
    }));
  };

  const removeConsumition = (index: number) => {
    if (!modalState.selectedPayment) return;

    const consumition = modalState.selectedPayment.consumitions[index];
    const consumitionAmount = consumition.quantity * consumition.price;
    setModalState((prev) => ({
      ...prev,
      selectedPayment: {
        ...prev.selectedPayment!,
        consumitions: prev.selectedPayment!.consumitions.filter(
          (_, i) => i !== index
        ),
        consumitionAmount:
          prev.selectedPayment!.consumitionAmount - consumitionAmount,
        balance: prev.selectedPayment!.balance + consumitionAmount,
      },
    }));
  };

  const savePayment = (payment: CourtPayment) => {
    if (modalState.isNew) {
      // Crear nuevo pago
      const newId = Date.now().toString();
      const newPaymentEntry = {
        ...payment,
        id: newId,
        court: payment.court || 1,
      };

      setPaymentsByDay((prev) =>
        prev.map((schedule) => {
          if (schedule.schedule === payment.hour) {
            const updatedCourt = [...schedule.court];
            updatedCourt[payment.court - 1] = newPaymentEntry;
            return { ...schedule, court: updatedCourt };
          }
          return schedule;
        })
      );
    } else {
      // Actualizar pago existente
      setPaymentsByDay((prev) =>
        prev.map((schedule) => ({
          ...schedule,
          court: schedule.court.map((courtPayment) => {
            if (courtPayment?.id === payment.id) {
              return payment;
            }
            return courtPayment;
          }),
        }))
      );
    }

    closePaymentModal();
  };

  return (
    <PaymentCourtContext.Provider
      value={{
        date,
        setDate,
        paymentsByDay,
        setPaymentsByDay,
        modalState,
        openPaymentModal,
        closePaymentModal,
        completePayment,
        addPayment,
        addConsumition,
        removePayment,
        removeConsumition,
        savePayment,
      }}
    >
      {children}
    </PaymentCourtContext.Provider>
  );
};

export const usePaymentCourt = () => {
  const context = useContext(PaymentCourtContext);
  if (!context) {
    throw new Error(
      "usePaymentCourt must be used within a PaymentCourtProvider"
    );
  }
  return context;
};

// Datos hardcodeados de ejemplo (mover a un archivo aparte si es necesario)
const mockPaymentsData: SchedulePayment[] = [
  // ... tus datos mock aquí
];
