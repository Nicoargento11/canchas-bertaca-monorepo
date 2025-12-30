"use client";

import { Card } from "@/components/ui/card";
import { Users, UserPlus, XCircle, TrendingUp } from "lucide-react";

interface DailyData {
    day: string;
    reservas: number;
    ingresos: number;
    diaAnterior: number;
    cancelaciones: number;
    ocupacion: number;
    clientesNuevos: number;
}

interface ClientMetricsCardProps {
    dailyData: DailyData[];
}

export function ClientMetricsCard({ dailyData }: ClientMetricsCardProps) {
    // Calculate totals
    const totalNewClients = dailyData.reduce((sum, d) => sum + d.clientesNuevos, 0);
    const totalCancelaciones = dailyData.reduce((sum, d) => sum + d.cancelaciones, 0);
    const totalReservas = dailyData.reduce((sum, d) => sum + d.reservas, 0);

    const cancelationRate = totalReservas > 0
        ? Math.round((totalCancelaciones / (totalReservas + totalCancelaciones)) * 100)
        : 0;

    const avgNewClientsPerDay = dailyData.length > 0
        ? Math.round(totalNewClients / dailyData.length)
        : 0;

    return (
        <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Métricas de Clientes</h3>
                    <p className="text-sm text-muted-foreground">
                        Análisis del período seleccionado
                    </p>
                </div>
                <Users className="h-5 w-5 text-purple-600" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* New Clients */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserPlus className="h-4 w-4 text-green-600" />
                        <span>Clientes Nuevos</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-green-600">
                            {totalNewClients}
                        </p>
                        {dailyData.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                                ~{avgNewClientsPerDay}/día
                            </span>
                        )}
                    </div>
                </div>

                {/* Cancelations */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span>Cancelaciones</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-red-600">
                            {totalCancelaciones}
                        </p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${cancelationRate < 10
                                ? "bg-green-100 text-green-700"
                                : cancelationRate < 20
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-red-100 text-red-700"
                            }`}>
                            {cancelationRate}%
                        </span>
                    </div>
                </div>

                {/* Retention insight */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <TrendingUp className="h-4 w-4 text-blue-600" />
                        <span>Tasa de Retención</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <p className="text-3xl font-bold text-blue-600">
                            {Math.max(0, 100 - cancelationRate)}%
                        </p>
                        <span className="text-xs text-muted-foreground">
                            {cancelationRate < 10 ? "Excelente" : cancelationRate < 20 ? "Bueno" : "Mejorable"}
                        </span>
                    </div>
                </div>
            </div>

            {/* Insights */}
            <div className="mt-4 pt-4 border-t space-y-2">
                {cancelationRate > 20 && (
                    <div className="p-3 bg-amber-50 rounded-lg text-xs text-amber-900">
                        <p className="font-medium mb-1">⚠️ Alta tasa de cancelación</p>
                        <p>
                            Considera implementar políticas de cancelación más estrictas o
                            incentivos para reducir las cancelaciones.
                        </p>
                    </div>
                )}

                {totalNewClients > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg text-xs text-green-900">
                        <p className="font-medium mb-1">✅ Crecimiento positivo</p>
                        <p>
                            Tienes {totalNewClients} cliente(s) nuevo(s) en este período.
                            Mantén el buen trabajo en la captación de clientes.
                        </p>
                    </div>
                )}

                {totalNewClients === 0 && dailyData.length > 3 && (
                    <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-900">
                        <p className="font-medium mb-1">💡 Oportunidad de crecimiento</p>
                        <p>
                            No se registraron clientes nuevos. Considera lanzar campañas de
                            marketing para atraer nuevos usuarios.
                        </p>
                    </div>
                )}
            </div>
        </Card>
    );
}
