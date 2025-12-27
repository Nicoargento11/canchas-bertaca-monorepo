"use client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { DollarSign } from "lucide-react";
import { OpenCashRegister } from "../stock/OpenCashRegister";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { useCashRegisterStore } from "@/store/cash-register";
import { getActiveCashSession } from "@/services/cash-session/cash-session";
import { getAllCashRegisters } from "@/services/cash-register/cash-register";

export const SideBarButton = () => {
  const [showOpenCashModal, setShowOpenCashModal] = useState(false);
  const [hasActiveCashSession, setHasActiveCashSession] = useState(false);
  const { state } = useReservationDashboard();
  const { activeRegister } = useCashRegisterStore();

  // Check for active cash session
  useEffect(() => {
    const checkCashSession = async () => {
      if (state.currentComplex?.id) {
        const { success, data: cashRegisters } = await getAllCashRegisters(state.currentComplex.id);
        if (success && cashRegisters && cashRegisters.length > 0) {
          const activeCashRegister = cashRegisters.find((register) => register.isActive);
          if (activeCashRegister) {
            const { success: sessionSuccess, data: activeCashSession } = await getActiveCashSession(activeCashRegister.id);
            setHasActiveCashSession(sessionSuccess && !!activeCashSession);
          }
        }
      }
    };
    checkCashSession();
  }, [state.currentComplex?.id]);

  const handleCashOpened = () => {
    setShowOpenCashModal(false);
    setHasActiveCashSession(true);
  };

  // Only show button if there's no active cash session
  if (hasActiveCashSession) {
    return null;
  }

  return (
    <>
      <Dialog open={showOpenCashModal} onOpenChange={setShowOpenCashModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Apertura de Caja</DialogTitle>
          </DialogHeader>
          <OpenCashRegister
            complexId={state.currentComplex?.id}
            userId={undefined}
            cashRegisterId={activeRegister?.id}
            onCashOpened={handleCashOpened}
          />
        </DialogContent>
      </Dialog>

      {/* Mobile: solo icono */}
      <Button
        onClick={() => setShowOpenCashModal(true)}
        size={"sm"}
        className="md:hidden px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
        title="Abrir Caja"
      >
        <DollarSign size={18} />
      </Button>

      {/* Desktop: icono + texto */}
      <Button
        onClick={() => setShowOpenCashModal(true)}
        size={"sm"}
        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-sm"
        title="Abrir Caja"
      >
        <DollarSign size={18} />
        <span>Abrir Caja</span>
      </Button>
    </>
  );
};
