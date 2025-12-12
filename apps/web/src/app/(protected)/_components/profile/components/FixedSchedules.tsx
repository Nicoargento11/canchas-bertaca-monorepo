"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Users, AlertTriangle, Building2 } from "lucide-react";
import { FixedReserve } from "@/services/fixed-reserve/fixed-reserve";

interface FixedSchedulesProps {
  schedules: FixedReserve[];
}

export const FixedSchedules = ({ schedules }: FixedSchedulesProps) => {
  const getDayName = (dayNumber: number) => {
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    return days[dayNumber] || "Día desconocido";
  };

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-Primary/20 to-Primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-10 h-10 sm:w-12 sm:h-12 text-Primary" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Sin turnos fijos</h3>
        <p className="text-white/70 text-sm sm:text-base">
          Podés reservar un turno fijo semanal para asegurar tu cancha
        </p>
      </div>
    );
  }

  const getDayColor = (day: number) => {
    const colors: Record<number, string> = {
      0: "from-blue-500/20 to-cyan-500/20 border-blue-500/30",
      1: "from-green-500/20 to-emerald-500/20 border-green-500/30",
      2: "from-yellow-500/20 to-orange-500/20 border-yellow-500/30",
      3: "from-purple-500/20 to-pink-500/20 border-purple-500/30",
      4: "from-red-500/20 to-rose-500/20 border-red-500/30",
      5: "from-indigo-500/20 to-violet-500/20 border-indigo-500/30",
      6: "from-teal-500/20 to-cyan-500/20 border-teal-500/30",
    };
    return colors[day] || "from-slate-500/20 to-slate-600/20 border-slate-500/30";
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "ACTIVO":
        return {
          icon: "✅",
          label: "Activo",
          color: "bg-Success/20 text-Success-dark border-Success/30 hover:bg-Success/30",
        };
      case "PENDIENTE_PAGO":
        return {
          icon: "⚠️",
          label: "Pago pendiente",
          color: "bg-Warning/20 text-Warning-dark border-Warning/30 hover:bg-Warning/30",
        };
      case "SUSPENDIDO":
        return {
          icon: "❌",
          label: "Suspendido",
          color: "bg-Error/20 text-Error-dark border-Error/30 hover:bg-Error/30",
        };
      default:
        return {
          icon: "ℹ️",
          label: status,
          color: "bg-Neutral/20 text-Neutral-dark border-Neutral/30 hover:bg-Neutral/30",
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
          <Clock className="w-6 h-6 text-Primary" />
          Turnos Fijos
        </h3>
        <Badge className="bg-Primary/20 text-Primary-light border-Primary/30 hover:bg-Primary/30">
          {schedules.length} {schedules.length === 1 ? "turno" : "turnos"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((schedule) => {
          const statusConfig = getStatusConfig(schedule.isActive ? "ACTIVO" : "SUSPENDIDO");
          const dayName = getDayName(schedule.scheduleDay.dayOfWeek);

          return (
            <Card
              key={schedule.id}
              className="bg-white/5 backdrop-blur-sm border border-white/10 hover:shadow-lg transition-all duration-300 overflow-hidden group"
            >
              {/* Colored top bar */}
              <div
                className={`h-1.5 bg-gradient-to-r ${getDayColor(schedule.scheduleDay.dayOfWeek).split(" ")[0].replace("from-", "from-").replace("/20", "")}`}
              />

              <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-Primary" />
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-white">{dayName}</h4>
                        <p className="text-xs text-white/60">Turno semanal</p>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${statusConfig.color} text-xs`}>{statusConfig.label}</Badge>
                </div>

                {/* Time and Court Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <Clock className="w-4 h-4 text-Primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-white/60">Horario</p>
                      <p className="text-sm font-bold text-white">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <MapPin className="w-4 h-4 text-Success flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-white/60">Cancha</p>
                      <p className="text-sm font-bold text-white">{schedule.court.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-white/10 rounded-lg">
                    <Building2 className="w-4 h-4 text-Primary flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs text-white/60">Complejo</p>
                      <p className="text-sm font-bold text-white">
                        {schedule.complex?.name || "Complejo"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action button */}
                {/* <button className="w-full mt-4 py-2.5 bg-Primary/10 hover:bg-Primary/20 text-Primary font-semibold rounded-lg transition-colors text-sm">
                  Ver detalles
                </button> */}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Group Info */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <Users className="w-5 h-5 text-Primary flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-base font-bold text-white mb-1">
                ¿Querés agregar amigos a tu turno fijo?
              </h4>
              <p className="text-sm text-white/70 mb-3">
                Podés invitar a otros jugadores para compartir el costo y asegurar tu equipo
                completo cada semana.
              </p>
              <button className="text-sm font-semibold text-Primary hover:text-Primary-light transition-colors">
                Administrar grupo →
              </button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
