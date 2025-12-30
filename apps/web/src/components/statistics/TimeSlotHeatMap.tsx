"use client";

import { Card } from "@/components/ui/card";
import { Clock, Info } from "lucide-react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

interface HorarioData {
    hora: string;
    reservas: number;
}

interface TimeSlotHeatMapProps {
    horarios: HorarioData[];
}

export function TimeSlotHeatMap({ horarios }: TimeSlotHeatMapProps) {
    // Group by day and time slot
    // Since backend returns time ranges like "08:00-09:00", we'll organize them
    const maxReservas = Math.max(...horarios.map(h => h.reservas), 1);

    const getIntensityColor = (reservas: number) => {
        const intensity = (reservas / maxReservas) * 100;
        if (intensity >= 70) return "bg-emerald-500 hover:bg-emerald-600";
        if (intensity >= 40) return "bg-amber-400 hover:bg-amber-500";
        if (intensity > 0) return "bg-red-400 hover:bg-red-500";
        return "bg-muted hover:bg-muted/80";
    };

    const getIntensityLabel = (reservas: number) => {
        const intensity = (reservas / maxReservas) * 100;
        if (intensity >= 70) return "Alta ocupación";
        if (intensity >= 40) return "Ocupación media";
        if (intensity > 0) return "Ocupación baja";
        return "Sin reservas";
    };

    return (
        <Card className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Horarios Más Reservados</h3>
                    <p className="text-sm text-muted-foreground">
                        Análisis de demanda por franja horaria
                    </p>
                </div>
                <Clock className="h-5 w-5 text-blue-600" />
            </div>

            {horarios.length === 0 ? (
                <div className="flex items-center gap-2 text-muted-foreground py-8 justify-center">
                    <Info className="h-5 w-5" />
                    <span>No hay datos de horarios disponibles</span>
                </div>
            ) : (
                <div className="space-y-3">
                    <TooltipProvider>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                            {horarios.map((horario, index) => (
                                <Tooltip key={index}>
                                    <TooltipTrigger asChild>
                                        <div
                                            className={`relative p-3 rounded-lg transition-all cursor-pointer ${getIntensityColor(
                                                horario.reservas
                                            )}`}
                                        >
                                            <div className="text-xs font-medium text-white text-center">
                                                {horario.hora}
                                            </div>
                                            <div className="text-lg font-bold text-white text-center mt-1">
                                                {horario.reservas}
                                            </div>
                                        </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="font-medium">{horario.hora}</p>
                                        <p className="text-sm">
                                            {horario.reservas} reserva(s)
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {getIntensityLabel(horario.reservas)}
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            ))}
                        </div>
                    </TooltipProvider>

                    {/* Legend */}
                    <div className="mt-6 pt-4 border-t">
                        <div className="flex items-center justify-between text-xs text-muted-foreground flex-wrap gap-2">
                            <span className="font-medium">Leyenda:</span>
                            <div className="flex items-center gap-4 flex-wrap">
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded bg-emerald-500" />
                                    <span>Alta (≥70%)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded bg-amber-400" />
                                    <span>Media (40-70%)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded bg-red-400" />
                                    <span>Baja (&lt;40%)</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="w-4 h-4 rounded bg-muted border" />
                                    <span>Sin reservas</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Insights */}
                    {horarios.length > 0 && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 text-blue-600 mt-0.5" />
                                <div className="text-xs text-blue-900">
                                    <p className="font-medium mb-1">💡 Insight:</p>
                                    <p>
                                        Los horarios en rojo son oportunidades para crear promociones
                                        y aumentar la ocupación.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </Card>
    );
}
