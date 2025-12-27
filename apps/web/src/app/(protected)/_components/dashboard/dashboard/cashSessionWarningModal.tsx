"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { useCashSessionWarningModalStore } from "@/store/cashSessionWarningModalStore";
import { useDashboardReserveModalStore } from "@/store/reserveDashboardModalStore";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { useState, useEffect } from "react";
import { OpenCashRegister } from "../../stock/OpenCashRegister";
import { useCashRegisterStore } from "@/store/cash-register";
import { getAllCashRegisters, CashRegister } from "@/services/cash-register/cash-register";

export const CashSessionWarningModal = () => {
    const { isOpen, reserveData, handleClose } = useCashSessionWarningModalStore();
    const { handleChangeReserve } = useDashboardReserveModalStore();
    const { state } = useReservationDashboard();
    const [showOpenCash, setShowOpenCash] = useState(false);
    const { activeRegister } = useCashRegisterStore();
    const [availableCashRegisters, setAvailableCashRegisters] = useState<CashRegister[]>([]);
    const [selectedCashRegister, setSelectedCashRegister] = useState<CashRegister | null>(null);

    // Load cash registers when modal opens
    useEffect(() => {
        const loadCashRegisters = async () => {
            if (isOpen && state.currentComplex?.id) {
                const { success, data } = await getAllCashRegisters(state.currentComplex.id);
                if (success && data) {
                    setAvailableCashRegisters(data);
                    // Select first active register, or first one if none active
                    const activeCashReg = data.find((reg) => reg.isActive) || data[0];
                    setSelectedCashRegister(activeCashReg);
                }
            }
        };
        loadCashRegisters();
    }, [isOpen, state.currentComplex?.id]);

    const handleContinueAnyway = () => {
        handleClose();
        handleChangeReserve();
    };

    const handleOpenCashRegister = () => {
        setShowOpenCash(true);
    };

    const handleCashOpened = () => {
        setShowOpenCash(false);
        handleClose();
        handleChangeReserve();
    };

    return (
        <>
            {/* Modal to open cash register */}
            <Dialog open={showOpenCash} onOpenChange={setShowOpenCash}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Apertura de Caja</DialogTitle>
                    </DialogHeader>
                    <OpenCashRegister
                        complexId={state.currentComplex?.id}
                        userId={reserveData?.userId}
                        cashRegisterId={selectedCashRegister?.id || activeRegister?.id}
                        onCashOpened={handleCashOpened}
                    />
                </DialogContent>
            </Dialog>

            {/* Warning modal */}
            <Dialog open={isOpen && !showOpenCash} onOpenChange={handleClose}>
                <DialogContent className="sm:max-w-[420px] w-[calc(100vw-2rem)] max-h-[90vh]">
                    <DialogHeader className="space-y-2">
                        <div className="flex items-start gap-2">
                            <div className="p-2 bg-amber-100 rounded-full flex-shrink-0">
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <DialogTitle className="text-base font-semibold break-words">
                                    No hay sesión de caja activa
                                </DialogTitle>
                                <DialogDescription className="text-xs mt-1 break-words">
                                    Se recomienda abrir caja antes de crear reservas para un mejor control.
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5">
                        <p className="text-xs text-amber-800 break-words leading-relaxed">
                            <strong className="font-medium">Importante:</strong> Registra los pagos en la caja para mantener orden.
                        </p>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button variant="outline" onClick={handleClose} className="w-full sm:w-auto text-sm">
                            Cancelar
                        </Button>
                        <Button
                            variant="outline"
                            onClick={handleContinueAnyway}
                            className="w-full sm:w-auto border-amber-300 text-amber-700 hover:bg-amber-50 text-sm"
                        >
                            Continuar sin caja
                        </Button>
                        <Button
                            onClick={handleOpenCashRegister}
                            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-sm"
                            disabled={!selectedCashRegister && !activeRegister && availableCashRegisters.length === 0}
                        >
                            Abrir Caja
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};
