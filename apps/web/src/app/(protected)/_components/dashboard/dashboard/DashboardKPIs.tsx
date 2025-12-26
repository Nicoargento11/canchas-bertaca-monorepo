"use client";
import React, { useMemo } from "react";
import { Wallet, AlertTriangle, Clock } from "lucide-react";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { Reserve } from "@/services/reserve/reserve";

interface KPICardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    variant: "success" | "warning" | "neutral";
    subtitle?: string;
}

const KPICard = ({ title, value, icon, variant, subtitle }: KPICardProps) => {
    const variantStyles = {
        success: "border-emerald-200 bg-emerald-50/50",
        warning: "border-amber-200 bg-amber-50/50",
        neutral: "border-gray-200 bg-gray-50/50",
    };

    const valueStyles = {
        success: "text-emerald-700",
        warning: "text-amber-700",
        neutral: "text-gray-700",
    };

    const iconStyles = {
        success: "text-emerald-500",
        warning: "text-amber-500",
        neutral: "text-gray-500",
    };

    return (
        <div
            className={`flex-1 min-w-[140px] p-4 rounded-xl border ${variantStyles[variant]} transition-all hover:shadow-sm`}
        >
            <div className="flex items-center gap-3">
                <div className={`${iconStyles[variant]}`}>{icon}</div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                        {title}
                    </p>
                    <p className={`text-xl font-bold ${valueStyles[variant]} truncate`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const DashboardKPIs = () => {
    const { state } = useReservationDashboard();
    const { reservationsByDay } = state;

    // Calcular métricas
    const metrics = useMemo(() => {
        if (!reservationsByDay || reservationsByDay.length === 0) {
            return {
                cajaHoy: 0,
                porCobrar: 0,
                proximoTurno: null as { schedule: string; courts: string[] } | null,
            };
        }

        let cajaHoy = 0;
        let porCobrar = 0;
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
                // Caja del día: suma de reservationAmount de reservas APROBADO o COMPLETADO
                if (reserve.status === "APROBADO" || reserve.status === "COMPLETADO") {
                    cajaHoy += reserve.reservationAmount || 0;
                }

                // Por cobrar: suma de (price - reservationAmount) de reservas APROBADO
                if (reserve.status === "APROBADO") {
                    const pendiente = (reserve.price || 0) - (reserve.reservationAmount || 0);
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

        return { cajaHoy, porCobrar, proximoTurno };
    }, [reservationsByDay]);

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
            {/* Desktop: horizontal cards con más espacio */}
            <div className="hidden md:flex gap-3">
                <KPICard
                    title="Caja del Día"
                    value={formatCurrency(metrics.cajaHoy)}
                    icon={<Wallet size={20} />}
                    variant="success"
                />
                <KPICard
                    title="Por Cobrar"
                    value={formatCurrency(metrics.porCobrar)}
                    icon={<AlertTriangle size={20} />}
                    variant={metrics.porCobrar > 0 ? "warning" : "neutral"}
                />
                <KPICard
                    title="Próximo Turno"
                    value={getProximoTurnoText()}
                    icon={<Clock size={20} />}
                    variant="neutral"
                />
            </div>

            {/* Mobile: grid compacto de 3 columnas */}
            <div className="grid grid-cols-3 gap-2 md:hidden">
                <div className="p-2 rounded-lg border border-emerald-200 bg-emerald-50/50">
                    <p className="text-[10px] text-gray-500 uppercase">Caja</p>
                    <p className="text-sm font-bold text-emerald-700 truncate">{formatCurrency(metrics.cajaHoy)}</p>
                </div>
                <div className={`p-2 rounded-lg border ${metrics.porCobrar > 0 ? 'border-amber-200 bg-amber-50/50' : 'border-gray-200 bg-gray-50/50'}`}>
                    <p className="text-[10px] text-gray-500 uppercase">Por Cobrar</p>
                    <p className={`text-sm font-bold truncate ${metrics.porCobrar > 0 ? 'text-amber-700' : 'text-gray-700'}`}>{formatCurrency(metrics.porCobrar)}</p>
                </div>
                <div className="p-2 rounded-lg border border-gray-200 bg-gray-50/50">
                    <p className="text-[10px] text-gray-500 uppercase">Próximo</p>
                    <p className="text-sm font-bold text-gray-700 truncate">{metrics.proximoTurno?.schedule || "-"}hs</p>
                </div>
            </div>
        </div>
    );
};

export default DashboardKPIs;
