"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, AlertCircle } from "lucide-react";

interface CourtData {
    name: string;
    reservas: number;
}

interface CourtPerformanceCardProps {
    courts: CourtData[];
    totalReservations: number;
}

export function CourtPerformanceCard({ courts, totalReservations }: CourtPerformanceCardProps) {
    // Calculate max reservations for relative comparison
    const maxReservations = Math.max(...courts.map(c => c.reservas), 1);

    const getOccupancyColor = (percentage: number) => {
        if (percentage >= 70) return "bg-emerald-500";
        if (percentage >= 40) return "bg-amber-500";
        return "bg-red-500";
    };

    const getOccupancyStatus = (percentage: number) => {
        if (percentage >= 70) return "Excelente";
        if (percentage >= 40) return "Medio";
        return "Bajo";
    };

    return (
        <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Rendimiento por Cancha</h3>
                    <p className="text-sm text-muted-foreground">
                        Reservas totales: {totalReservations}
                    </p>
                </div>
                <TrendingUp className="h-5 w-5 text-blue-600" />
            </div>

            <div className="space-y-4">
                {courts.length === 0 ? (
                    <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                        <AlertCircle className="h-5 w-5" />
                        <span>No hay datos de canchas disponibles</span>
                    </div>
                ) : (
                    courts.map((court, index) => {
                        const percentage = maxReservations > 0
                            ? Math.round((court.reservas / maxReservations) * 100)
                            : 0;
                        const shareOfTotal = totalReservations > 0
                            ? Math.round((court.reservas / totalReservations) * 100)
                            : 0;

                        return (
                            <div key={index} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{court.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            ({shareOfTotal}% del total)
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold">{court.reservas}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded-full ${percentage >= 70
                                                ? "bg-emerald-100 text-emerald-700"
                                                : percentage >= 40
                                                    ? "bg-amber-100 text-amber-700"
                                                    : "bg-red-100 text-red-700"
                                            }`}>
                                            {getOccupancyStatus(percentage)}
                                        </span>
                                    </div>
                                </div>
                                <div className="relative">
                                    <Progress
                                        value={percentage}
                                        className="h-2"
                                    />
                                    <div
                                        className={`absolute top-0 left-0 h-2 rounded-full transition-all ${getOccupancyColor(percentage)}`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {courts.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                <span>Excelente (≥70%)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-amber-500" />
                                <span>Medio (40-70%)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <div className="w-3 h-3 rounded-full bg-red-500" />
                                <span>Bajo (&lt;40%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
}
