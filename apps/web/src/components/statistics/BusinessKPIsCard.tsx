"use client";

import { Card } from "@/components/ui/card";
import {
    DollarSign,
    Clock,
    TrendingUp,
    XCircle,
    BarChart3,
    ArrowUp,
    ArrowDown,
    Minus,
    Info,
} from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface BusinessKPIsCardProps {
    averageTicket: number;
    previousAverageTicket: number;
    revenuePerHour: number;
    previousRevenuePerHour: number;
    netMarginPercentage: number;
    previousNetMarginPercentage: number;
    cancellationRate: number;
    previousCancellationRate: number;
    totalOccupancy: number;
}

export function BusinessKPIsCard({
    averageTicket,
    previousAverageTicket,
    revenuePerHour,
    previousRevenuePerHour,
    netMarginPercentage,
    previousNetMarginPercentage,
    cancellationRate,
    previousCancellationRate,
    totalOccupancy,
}: BusinessKPIsCardProps) {
    const calculateChange = (current: number, previous: number) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const getChangeIcon = (change: number) => {
        if (change > 5) return <ArrowUp className="h-4 w-4" />;
        if (change < -5) return <ArrowDown className="h-4 w-4" />;
        return <Minus className="h-4 w-4" />;
    };

    const getChangeColor = (change: number, isLowerBetter: boolean = false) => {
        if (isLowerBetter) {
            if (change < -5) return "text-green-600";
            if (change > 5) return "text-red-600";
        } else {
            if (change > 5) return "text-green-600";
            if (change < -5) return "text-red-600";
        }
        return "text-muted-foreground";
    };

    const getStatusColor = (value: number, thresholds: { low: number; high: number }) => {
        if (value >= thresholds.high) return "text-green-600 bg-green-50";
        if (value >= thresholds.low) return "text-amber-600 bg-amber-50";
        return "text-red-600 bg-red-50";
    };

    const ticketChange = calculateChange(averageTicket, previousAverageTicket);
    const revenuePerHourChange = calculateChange(revenuePerHour, previousRevenuePerHour);
    const marginChange = netMarginPercentage - previousNetMarginPercentage;
    const cancellationChange = cancellationRate - previousCancellationRate;

    return (
        <TooltipProvider>
            <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-semibold">KPIs de Negocio</h3>
                        <p className="text-sm text-muted-foreground">
                            Métricas clave vs período anterior
                        </p>
                    </div>
                    <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                    {/* Average Ticket */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <DollarSign className="h-4 w-4 text-emerald-600" />
                            <span>Ticket Promedio</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">¿Qué es?</p>
                                    <p className="text-xs mb-2">
                                        Cuánto gasta en promedio cada cliente por transacción.
                                    </p>
                                    <p className="font-medium mb-1">¿Para qué sirve?</p>
                                    <p className="text-xs">
                                        Si sube, los clientes están gastando más. Si baja, necesitas
                                        estrategias para aumentar el gasto (ej: combos, productos adicionales).
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">
                                ${averageTicket.toLocaleString("es-AR")}
                            </p>
                            {previousAverageTicket > 0 && (
                                <div className={`flex items-center gap-1 text-xs ${getChangeColor(ticketChange)}`}>
                                    {getChangeIcon(ticketChange)}
                                    <span>
                                        {Math.abs(ticketChange).toFixed(1)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Revenue Per Hour */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="h-4 w-4 text-blue-600" />
                            <span>Ingresos/Hora</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">¿Qué es?</p>
                                    <p className="text-xs mb-2">
                                        Cuánto dinero generas por cada hora de cancha reservada.
                                    </p>
                                    <p className="font-medium mb-1">¿Para qué sirve?</p>
                                    <p className="text-xs">
                                        Ver si tus precios son competitivos y si estás aprovechando bien
                                        el tiempo. Si es bajo, considera ajustar precios por horario.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">
                                ${revenuePerHour.toLocaleString("es-AR")}
                            </p>
                            {previousRevenuePerHour > 0 && (
                                <div className={`flex items-center gap-1 text-xs ${getChangeColor(revenuePerHourChange)}`}>
                                    {getChangeIcon(revenuePerHourChange)}
                                    <span>
                                        {Math.abs(revenuePerHourChange).toFixed(1)}%
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Net Margin */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <TrendingUp className="h-4 w-4 text-purple-600" />
                            <span>Margen Neto</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">¿Qué es?</p>
                                    <p className="text-xs mb-2">
                                        Qué porcentaje de tus ingresos es ganancia real (después de gastos).
                                    </p>
                                    <p className="font-medium mb-1">¿Para qué sirve?</p>
                                    <p className="text-xs">
                                        LA métrica más importante. Más de 50% = excelente, 30-50% = bien, menos de 30% = revisa costos.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold">{netMarginPercentage}%</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(netMarginPercentage, { low: 30, high: 50 })}`}>
                                    {netMarginPercentage >= 50 ? "Excelente" : netMarginPercentage >= 30 ? "Bueno" : "Bajo"}
                                </span>
                            </div>
                            {previousNetMarginPercentage > 0 && (
                                <div className={`flex items-center gap-1 text-xs ${getChangeColor(marginChange)}`}>
                                    {getChangeIcon(marginChange)}
                                    <span>
                                        {Math.abs(marginChange).toFixed(1)}pp
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Cancellation Rate */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <XCircle className="h-4 w-4 text-red-600" />
                            <span>Tasa Cancel.</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">¿Qué es?</p>
                                    <p className="text-xs mb-2">
                                        Qué porcentaje de reservas se cancelan.
                                    </p>
                                    <p className="font-medium mb-1">¿Para qué sirve?</p>
                                    <p className="text-xs">
                                        Medir confiabilidad. Si es mayor a 20%, implementa seña obligatoria
                                        o políticas de cancelación más estrictas.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold">{cancellationRate}%</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(cancellationRate, { low: 20, high: 10 })}`}>
                                    {cancellationRate < 10 ? "Excelente" : cancellationRate < 20 ? "Bueno" : "Alto"}
                                </span>
                            </div>
                            {previousCancellationRate > 0 && (
                                <div className={`flex items-center gap-1 text-xs ${getChangeColor(cancellationChange, true)}`}>
                                    {getChangeIcon(cancellationChange)}
                                    <span>
                                        {Math.abs(cancellationChange).toFixed(1)}pp
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Total Occupancy */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <BarChart3 className="h-4 w-4 text-amber-600" />
                            <span>Ocupación</span>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">¿Qué es?</p>
                                    <p className="text-xs mb-2">
                                        Qué porcentaje de tus horarios disponibles están ocupados.
                                    </p>
                                    <p className="font-medium mb-1">¿Para qué sirve?</p>
                                    <p className="text-xs">
                                        Ver si aprovechas la capacidad. Si es menor a 40%, crea promociones
                                        para horarios vacíos. Si es mayor a 90%, considera aumentar precios.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                                <p className="text-2xl font-bold">{totalOccupancy}%</p>
                                <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(totalOccupancy, { low: 40, high: 70 })}`}>
                                    {totalOccupancy >= 70 ? "Excelente" : totalOccupancy >= 40 ? "Medio" : "Bajo"}
                                </span>
                            </div>
                            <p className="text-xs text-muted-foreground">del período</p>
                        </div>
                    </div>
                </div>

                {/* Insights Section */}
                <div className="mt-6 pt-4 border-t space-y-2">
                    {netMarginPercentage < 30 && (
                        <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-900">
                            <p className="font-medium mb-1">⚠️ Margen bajo</p>
                            <p>
                                Tu margen neto está por debajo del 30%. Considera revisar costos operativos
                                o ajustar precios.
                            </p>
                        </div>
                    )}

                    {cancellationRate > 20 && (
                        <div className="p-3 bg-red-50 rounded-lg text-xs text-red-900">
                            <p className="font-medium mb-1">🚨 Alta tasa de cancelación</p>
                            <p>
                                Más del 20% de reservas se cancelan. Implementa políticas de cancelación
                                más estrictas o incentivos para reducirlas.
                            </p>
                        </div>
                    )}

                    {totalOccupancy < 40 && (
                        <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-900">
                            <p className="font-medium mb-1">💡 Baja ocupación</p>
                            <p>
                                La ocupación está por debajo del 40%. Considera crear promociones
                                para horarios de baja demanda.
                            </p>
                        </div>
                    )}

                    {ticketChange > 10 && (
                        <div className="p-3 bg-green-50 rounded-lg text-xs text-green-900">
                            <p className="font-medium mb-1">✅ Ticket promedio en alza</p>
                            <p>
                                El ticket promedio creció {ticketChange.toFixed(1)}%. ¡Excelente trabajo!
                            </p>
                        </div>
                    )}
                </div>
            </Card>
        </TooltipProvider>
    );
}
