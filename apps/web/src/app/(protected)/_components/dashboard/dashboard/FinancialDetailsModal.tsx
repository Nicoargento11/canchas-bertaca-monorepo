"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useFinancialDetailsModalStore } from "@/store/financialDetailsModalStore";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { useCashRegisterStore } from "@/store/cash-register";
import { Reserve } from "@/services/reserve/reserve";
import { Payment, searchPayments } from "@/services/payment/payment";
import { useEffect, useState, useMemo } from "react";
import { DollarSign, TrendingUp, AlertTriangle, Wallet, CreditCard, Smartphone, Building2 } from "lucide-react";

export const FinancialDetailsModal = () => {
    const { isOpen, detailType, handleClose } = useFinancialDetailsModalStore();
    const { state } = useReservationDashboard();
    const { reservationsByDay } = state;
    const { activeSession } = useCashRegisterStore();
    const [allPayments, setAllPayments] = useState<Payment[]>([]);

    // Fetch payments when modal opens
    useEffect(() => {
        const fetchPayments = async () => {
            if (isOpen && state.currentComplex?.id) {
                const result = await searchPayments(state.currentComplex.id);
                if (result.success && result.data) {
                    setAllPayments(result.data);
                }
            }
        };
        fetchPayments();
    }, [isOpen, state.currentComplex?.id]);

    // Calculate details based on type
    const details = useMemo(() => {
        if (!reservationsByDay || reservationsByDay.length === 0) {
            return null;
        }

        const payments: Payment[] = [];
        const pendingReserves: Reserve[] = [];

        // Collect all payments and pending reserves
        reservationsByDay.forEach((scheduleData) => {
            scheduleData.court.forEach((reserve: Reserve) => {
                if (reserve.payment && reserve.payment.length > 0) {
                    payments.push(...reserve.payment);
                }

                // Por cobrar
                if (reserve.status === "APROBADO") {
                    const totalPagado = reserve.payment && reserve.payment.length > 0
                        ? reserve.payment.reduce((sum, p) => sum + p.amount, 0)
                        : reserve.reservationAmount || 0;
                    const pendiente = (reserve.price || 0) - totalPagado;
                    if (pendiente > 0) {
                        pendingReserves.push(reserve);
                    }
                }
            });
        });

        // Group by payment method
        const byMethod: Record<string, { amount: number; count: number; payments: Payment[] }> = {};

        switch (detailType) {
            case "caja_fisica":
                // Only cash payments from active session
                payments.forEach((payment) => {
                    if (
                        activeSession &&
                        payment.cashSessionId === activeSession.id &&
                        payment.method === "EFECTIVO"
                    ) {
                        if (!byMethod[payment.method]) {
                            byMethod[payment.method] = { amount: 0, count: 0, payments: [] };
                        }
                        byMethod[payment.method].amount += payment.amount;
                        byMethod[payment.method].count++;
                        byMethod[payment.method].payments.push(payment);
                    }
                });
                break;

            case "ingresos_totales":
                // All payments from the day
                payments.forEach((payment) => {
                    if (payment.transactionType !== "EGRESO") {
                        if (!byMethod[payment.method]) {
                            byMethod[payment.method] = { amount: 0, count: 0, payments: [] };
                        }
                        byMethod[payment.method].amount += payment.amount;
                        byMethod[payment.method].count++;
                        byMethod[payment.method].payments.push(payment);
                    }
                });
                break;

            case "egresos":
                // EGRESO payments from active session
                if (Array.isArray(allPayments) && allPayments.length > 0) {
                    allPayments.forEach((payment) => {
                        if (
                            activeSession &&
                            payment.transactionType === "EGRESO" &&
                            payment.cashSessionId === activeSession.id
                        ) {
                            if (!byMethod["EGRESO"]) {
                                byMethod["EGRESO"] = { amount: 0, count: 0, payments: [] };
                            }
                            byMethod["EGRESO"].amount += Math.abs(payment.amount);
                            byMethod["EGRESO"].count++;
                            byMethod["EGRESO"].payments.push(payment);
                        }
                    });
                }
                break;

            case "por_cobrar":
                return { pendingReserves };
        }

        return { byMethod };
    }, [detailType, reservationsByDay, activeSession, allPayments]);

    const getMethodIcon = (method: string) => {
        switch (method) {
            case "EFECTIVO":
                return <DollarSign className="h-4 w-4" />;
            case "TARJETA_CREDITO":
                return <CreditCard className="h-4 w-4" />;
            case "MERCADOPAGO":
                return <Smartphone className="h-4 w-4" />;
            case "TRANSFERENCIA":
                return <Building2 className="h-4 w-4" />;
            default:
                return <Wallet className="h-4 w-4" />;
        }
    };

    const getMethodName = (method: string) => {
        switch (method) {
            case "EFECTIVO":
                return "Efectivo";
            case "TARJETA_CREDITO":
                return "Tarjeta";
            case "MERCADOPAGO":
                return "MercadoPago";
            case "TRANSFERENCIA":
                return "Transferencia";
            case "EGRESO":
                return "Egreso";
            default:
                return method;
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0,
        });
    };

    const getTitle = () => {
        switch (detailType) {
            case "caja_fisica":
                return "💰 Detalle de Caja Física";
            case "ingresos_totales":
                return "📊 Detalle de Ingresos Totales";
            case "por_cobrar":
                return "⚠️ Detalle de Por Cobrar";
            case "egresos":
                return "💸 Detalle de Egresos";
            default:
                return "Detalles";
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle className="text-base">{getTitle()}</DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto pr-2">
                    {detailType === "por_cobrar" && details?.pendingReserves ? (
                        <div className="space-y-2">
                            {details.pendingReserves.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-8">No hay reservas pendientes</p>
                            ) : (
                                details.pendingReserves.map((reserve: Reserve) => {
                                    const totalPagado = reserve.payment && reserve.payment.length > 0
                                        ? reserve.payment.reduce((sum, p) => sum + p.amount, 0)
                                        : reserve.reservationAmount || 0;
                                    const pendiente = reserve.price - totalPagado;

                                    return (
                                        <div key={reserve.id} className="border rounded-lg p-2.5 bg-amber-50/30">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{reserve.clientName}</p>
                                                    <p className="text-xs text-gray-500 truncate">
                                                        {new Date(reserve.date).toLocaleDateString("es-AR")} - {reserve.schedule}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-amber-700 flex-shrink-0">{formatCurrency(pendiente)}</p>
                                            </div>
                                            <p className="text-xs text-gray-600 truncate">
                                                Total: {formatCurrency(reserve.price)} | Pagado: {formatCurrency(totalPagado)}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    ) : details?.byMethod ? (
                        <div className="space-y-3">
                            {Object.entries(details.byMethod).map(([method, data]) => (
                                <div key={method} className="border rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2 flex-1 min-w-0">
                                            <div className="p-1.5 bg-emerald-100 rounded-full text-emerald-700 flex-shrink-0">
                                                {getMethodIcon(method)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{getMethodName(method)}</p>
                                                <p className="text-xs text-gray-500 truncate">
                                                    {data.count} {data.count === 1 ? "transacción" : "transacciones"}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="text-base font-bold text-emerald-700 flex-shrink-0 ml-2">
                                            {formatCurrency(data.amount)}
                                        </p>
                                    </div>

                                    {/* List of payments */}
                                    <div className="space-y-1 mt-2 max-h-32 overflow-y-auto">
                                        {data.payments.slice(0, 5).map((payment, idx) => (
                                            <div key={idx} className="flex justify-between text-xs bg-gray-50 p-1.5 rounded gap-2">
                                                <span className="text-gray-600 flex-shrink-0">
                                                    {new Date(payment.createdAt).toLocaleTimeString("es-AR", {
                                                        hour: "2-digit",
                                                        minute: "2-digit"
                                                    })}
                                                </span>
                                                <span className="font-medium flex-shrink-0">
                                                    {formatCurrency(Math.abs(payment.amount))}
                                                </span>
                                            </div>
                                        ))}
                                        {data.payments.length > 5 && (
                                            <p className="text-xs text-gray-500 text-center pt-1">
                                                + {data.payments.length - 5} más
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {Object.keys(details.byMethod).length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-8">No hay movimientos registrados</p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-8">No hay datos disponibles</p>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
