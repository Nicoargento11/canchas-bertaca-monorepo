"use client";
import React, { useMemo, useEffect, useState } from "react";
import { Wallet, AlertTriangle, Clock, TrendingUp, DollarSign } from "lucide-react";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { Reserve } from "@/services/reserve/reserve";
import { useCashRegisterStore } from "@/store/cash-register";
import { Payment, searchPayments } from "@/services/payment/payment";
import { useFinancialDetailsModalStore } from "@/store/financialDetailsModalStore";

interface KPICardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    subtitle?: string;
    variant?: "success" | "warning" | "neutral";
    onClick?: () => void;
}

const KPICard = ({ title, value, icon, subtitle, variant = "neutral", onClick }: KPICardProps) => {
    const bgColor = {
        success: "bg-emerald-50/50 hover:bg-emerald-50",
        warning: "bg-amber-50/50 hover:bg-amber-50",
        neutral: "bg-gray-50/50 hover:bg-gray-50"
    }[variant];

    const borderColor = {
        success: "border-emerald-200",
        warning: "border-amber-200",
        neutral: "border-gray-200"
    }[variant];

    const iconColor = {
        success: "text-emerald-600",
        warning: "text-amber-600",
        neutral: "text-gray-600"
    }[variant];

    const valueColor = {
        success: "text-emerald-700",
        warning: "text-amber-700",
        neutral: "text-gray-700"
    }[variant];

    return (
        <div
            onClick={onClick}
            className={`flex flex-col gap-1.5 p-3 rounded-lg border ${borderColor} ${bgColor} transition-all ${onClick ? 'cursor-pointer' : ''}`}
        >
            <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500 font-medium uppercase">{title}</span>
                <span className={iconColor}>{icon}</span>
            </div>
            <p className={`text-2xl font-bold ${valueColor} truncate`}>{value}</p>
            {subtitle && <p className="text-[10px] text-gray-400">{subtitle}</p>}
        </div>
    );
};

export const DashboardKPIs = () => {
    const { state } = useReservationDashboard();
    const { reservationsByDay } = state;
    const { activeSession } = useCashRegisterStore();
    const [allPayments, setAllPayments] = useState<Payment[]>([]);
    const { handleOpen } = useFinancialDetailsModalStore();

    // Fetch all payments for egresos calculation
    useEffect(() => {
        const fetchPayments = async () => {
            if (state.currentComplex?.id) {
                const result = await searchPayments(state.currentComplex.id);
                if (result.success && result.data) {
                    setAllPayments(result.data);
                }
            }
        };
        fetchPayments();
    }, [state.currentComplex?.id]);

    // Calcular métricas
    const metrics = useMemo(() => {
        if (!reservationsByDay || reservationsByDay.length === 0) {
            return {
                cajaFisica: 0,
                ingresosTotales: 0,
                porCobrar: 0,
                egresos: 0,
                proximoTurno: null as { schedule: string; courts: string[] } | null,
            };
        }

        let cajaFisica = 0;  // Solo efectivo/mostrador con cashSessionId
        let ingresosTotales = 0;  // Todo lo del día (00:00-23:59)
        let porCobrar = 0;
        let egresos = 0;  // Retiros/gastos de la sesión
        const now = new Date();
        const currentHour = now.getHours();
        const currentMinutes = now.getMinutes();
        const currentTime = `${currentHour.toString().padStart(2, "0")}:${currentMinutes.toString().padStart(2, "0")}`;

        // Próximo turno info
        let proximoTurno: { schedule: string; courts: string[] } | null = null;

        reservationsByDay.forEach((scheduleData) => {
            const schedule = scheduleData.schedule;
            const [startTime] = schedule.split(" - ");

            scheduleData.court.forEach((reserve: Reserve) => {
                // CAJA FÍSICA: Solo efectivo/mostrador de esta sesión de caja
                if (reserve.payment && reserve.payment.length > 0) {
                    reserve.payment.forEach((payment) => {
                        // Solo pagos de la sesión activa y en efectivo
                        if (
                            activeSession &&
                            payment.cashSessionId === activeSession.id &&
                            payment.method === "EFECTIVO"
                        ) {
                            cajaFisica += payment.amount;
                        }
                    });
                }

                // INGRESOS TOTALES: Todo el día (caja física + online)
                // Todos los pagos de reservas del día
                if (reserve.payment && reserve.payment.length > 0) {
                    const totalPagado = reserve.payment.reduce((sum, p) => sum + p.amount, 0);
                    ingresosTotales += totalPagado;
                } else if (reserve.reservationAmount > 0) {
                    // Si no hay payments pero hay reservationAmount (legacy)
                    ingresosTotales += reserve.reservationAmount;
                }

                // Por cobrar: diferencia entre precio y lo pagado
                if (reserve.status === "APROBADO") {
                    const totalPagado = reserve.payment && reserve.payment.length > 0
                        ? reserve.payment.reduce((sum, p) => sum + p.amount, 0)
                        : reserve.reservationAmount || 0;

                    const pendiente = (reserve.price || 0) - totalPagado;
                    if (pendiente > 0) {
                        porCobrar += pendiente;
                    }
                }

                // Próximo turno: encontrar reservas después de la hora actual
                if (startTime > currentTime && !proximoTurno) {
                    proximoTurno = {
                        schedule: startTime,
                        courts: [],
                    };
                }
                if (proximoTurno && schedule.startsWith(proximoTurno.schedule)) {
                    if (reserve.status === "APROBADO" || reserve.status === "COMPLETADO") {
                        const courtName = reserve.court?.courtNumber
                            ? `Cancha ${reserve.court.courtNumber}`
                            : "Cancha";
                        if (!proximoTurno.courts.includes(courtName)) {
                            proximoTurno.courts.push(courtName);
                        }
                    }
                }
            });
        });

        // EGRESOS: Calcular de todos los payments tipo EGRESO de la sesión
        if (activeSession && allPayments.length > 0) {
            allPayments.forEach((payment) => {
                if (
                    payment.transactionType === "EGRESO" &&
                    payment.cashSessionId === activeSession.id
                ) {
                    // Los egresos vienen con amount negativo, pero los mostramos positivo
                    egresos += Math.abs(payment.amount);
                }
            });
        }

        // Si hay sesión activa, sumar el monto inicial a la caja física
        if (activeSession) {
            cajaFisica += activeSession.initialAmount;
        }

        return { cajaFisica, ingresosTotales, porCobrar, egresos, proximoTurno };
    }, [reservationsByDay, activeSession, allPayments]);

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("es-AR", {
            style: "currency",
            currency: "ARS",
            minimumFractionDigits: 0,
        });
    };

    const getProximoTurnoText = () => {
        if (!metrics.proximoTurno) return "Sin turnos pendientes";
        const { schedule, courts } = metrics.proximoTurno;
        if (courts.length === 0) return `${schedule}hs - Libre`;
        return `${schedule}hs - ${courts.join(" y ")}`;
    };

    return (
        <div className="w-full mb-4">
            {/* Desktop: 4 tarjetas horizontales */}
            <div className="hidden md:grid md:grid-cols-4 gap-3">
                <KPICard
                    title="💰 Caja Física"
                    value={formatCurrency(metrics.cajaFisica)}
                    icon={<DollarSign size={20} />}
                    variant="success"
                    subtitle="Efectivo/mostrador"
                    onClick={() => handleOpen("caja_fisica")}
                />
                <KPICard
                    title="📊 Ingresos Totales"
                    value={formatCurrency(metrics.ingresosTotales)}
                    icon={<TrendingUp size={20} />}
                    variant="success"
                    subtitle="Incluye online"
                    onClick={() => handleOpen("ingresos_totales")}
                />
                <KPICard
                    title="⚠️ Por Cobrar"
                    value={formatCurrency(metrics.porCobrar)}
                    icon={<AlertTriangle size={20} />}
                    variant={metrics.porCobrar > 0 ? "warning" : "neutral"}
                    onClick={() => handleOpen("por_cobrar")}
                />
                <KPICard
                    title="💸 Egresos"
                    value={formatCurrency(metrics.egresos)}
                    icon={<Wallet size={20} />}
                    variant="neutral"
                    subtitle="Retiros/gastos"
                    onClick={() => handleOpen("egresos")}
                />
            </div>

            {/* Mobile: grid compacto 2x2 */}
            <div className="grid grid-cols-2 gap-2 md:hidden">
                <div
                    onClick={() => handleOpen("caja_fisica")}
                    className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/50 cursor-pointer active:scale-95 transition-transform"
                >
                    <p className="text-[10px] text-gray-500 uppercase">💰 Caja</p>
                    <p className="text-sm font-bold text-emerald-700 truncate">{formatCurrency(metrics.cajaFisica)}</p>
                </div>
                <div
                    onClick={() => handleOpen("ingresos_totales")}
                    className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/50 cursor-pointer active:scale-95 transition-transform"
                >
                    <p className="text-[10px] text-gray-500 uppercase">📊 Ingresos</p>
                    <p className="text-sm font-bold text-emerald-700 truncate">{formatCurrency(metrics.ingresosTotales)}</p>
                </div>
                <div
                    onClick={() => handleOpen("por_cobrar")}
                    className={`p-2 rounded-lg border cursor-pointer active:scale-95 transition-transform ${metrics.porCobrar > 0 ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200 bg-gray-50/50'}`}
                >
                    <p className="text-[10px] text-gray-500 uppercase">⚠️ Por Cobrar</p>
                    <p className={`text-sm font-bold truncate ${metrics.porCobrar > 0 ? 'text-amber-700' : 'text-gray-700'}`}>{formatCurrency(metrics.porCobrar)}</p>
                </div>
                <div
                    onClick={() => handleOpen("egresos")}
                    className="p-2 rounded-lg border border-gray-200 bg-gray-50/50 cursor-pointer active:scale-95 transition-transform"
                >
                    <p className="text-[10px] text-gray-500 uppercase">💸 Egresos</p>
                    <p className="text-sm font-bold text-gray-700 truncate">{formatCurrency(metrics.egresos)}</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardKPIs;
