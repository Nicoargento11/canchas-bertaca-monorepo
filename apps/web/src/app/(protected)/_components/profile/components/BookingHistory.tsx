"use client";

import { Reserve } from "@/services/reserve/reserve";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Clock, XCircle, CheckCircle2, History, Building2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

interface BookingHistoryProps {
  reserves: Reserve[];
}

export const BookingHistory = ({ reserves }: BookingHistoryProps) => {
  if (reserves.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-Neutral/50 to-Neutral rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-10 h-10 sm:w-12 sm:h-12 text-Primary/50" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Sin historial todavía</h3>
        <p className="text-white/70 text-sm sm:text-base">Tus partidos jugados aparecerán aquí</p>
      </div>
    );
  }

  // Group by month
  const groupedByMonth = reserves.reduce<Record<string, Reserve[]>>((acc, reserve) => {
    const monthKey = format(new Date(reserve.date), "MMMM yyyy", { locale: es });
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(reserve);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(groupedByMonth).map(([month, monthReserves]) => (
        <div key={month}>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-4 capitalize flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-Primary" />
            {month}
            <Badge className="bg-white/10 text-white text-xs">{monthReserves.length}</Badge>
          </h3>

          <div className="space-y-3">
            {monthReserves.map((reserve) => (
              <HistoryCard key={reserve.id} reserve={reserve} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

interface HistoryCardProps {
  reserve: Reserve;
}

const HistoryCard = ({ reserve }: HistoryCardProps) => {
  // Fix timezone: parse only date portion
  const dateString = reserve.date.toString().split('T')[0];
  const reserveDate = parseISO(dateString);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APROBADO":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          label: "Completado",
          color: "bg-Success/20 text-Success-dark border-Success/30",
          bgGradient: "from-Success/5 to-Success/10",
        };
      case "RECHAZADO":
      case "CANCELADO":
        return {
          icon: <XCircle className="w-4 h-4" />,
          label: "Cancelado",
          color: "bg-Error/20 text-Error-dark border-Error/30",
          bgGradient: "from-Error/5 to-Error/10",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          label: status,
          color: "bg-Neutral/20 text-Neutral-dark border-Neutral/30",
          bgGradient: "from-Neutral/5 to-Neutral/10",
        };
    }
  };

  const statusConfig = getStatusConfig(reserve.status);

  return (
    <Card
      className={`bg-gradient-to-br ${statusConfig.bgGradient} bg-white/5 border-white/10 backdrop-blur-sm overflow-hidden hover:border-white/30 transition-colors`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Date & Time */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-black text-Primary">
                {format(reserveDate, "dd", { locale: es })}
              </div>
              <div className="text-xs text-white/70 font-semibold uppercase">
                {format(reserveDate, "MMM", { locale: es })}
              </div>
            </div>

            <div className="hidden sm:block w-px h-12 bg-white/10" />

            <div className="hidden sm:block">
              <div className="text-lg font-bold text-white">{reserve.schedule}</div>
            </div>
          </div>

          {/* Center: Court Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm sm:text-base font-bold text-white mb-1 truncate">
              {reserve.court.name}
            </h4>
            <div className="flex items-center gap-1 text-xs text-white/60 mb-1">
              {reserve.complex?.name?.toLowerCase().includes('seven') ? (
                <img src="/images/seven_logo.png" alt="Seven" className="w-3 h-3 object-contain" />
              ) : reserve.complex?.name?.toLowerCase().includes('bertaca') ? (
                <img src="/images/bertaca_logo.png" alt="Bertaca" className="w-3 h-3 object-contain" />
              ) : (
                <Building2 className="w-3 h-3" />
              )}
              <span className="truncate">{reserve.complex?.name || "Complejo"}</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm text-white/70">
              <CalendarDays className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="sm:hidden">{reserve.schedule}</span>
              <span className="hidden sm:inline">
                {format(reserveDate, "EEEE", { locale: es })}
              </span>
            </div>
          </div>

          {/* Right: Status Badge */}
          <Badge className={`${statusConfig.color} border text-xs flex-shrink-0`}>
            {statusConfig.icon}
            <span className="ml-1 hidden sm:inline">{statusConfig.label}</span>
          </Badge>
        </div>
      </div>
    </Card>
  );
};
