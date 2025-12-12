"use client";

import { Reserve } from "@/services/reserve/reserve";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  AlertCircle,
  CheckCircle2,
  Building2,
  CreditCard,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface UpcomingBookingsProps {
  reserves: Reserve[];
  onCancelBooking?: (id: string) => void;
}

export const UpcomingBookings = ({ reserves, onCancelBooking }: UpcomingBookingsProps) => {
  if (reserves.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-Primary/20 to-Primary-light/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <CalendarDays className="w-10 h-10 sm:w-12 sm:h-12 text-Primary" />
        </div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">No tenés partidos próximos</h3>
        <p className="text-white/70 text-sm sm:text-base">¡Reservá tu cancha y empezá a jugar!</p>
      </div>
    );
  }

  // Obtener el próximo partido más cercano
  const nextMatch = reserves[0];
  const daysUntil = Math.ceil(
    (new Date(nextMatch.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <div className="space-y-4">
      {/* Next Match Highlight - Mobile First */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20 border-2 border-green-500/30 rounded-2xl p-4 sm:p-6 backdrop-blur-sm"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <Badge className="bg-green-500 text-white mb-2 text-xs sm:text-sm">
              Próximo Partido
            </Badge>
            <h3 className="text-xl sm:text-2xl font-black text-white">
              {daysUntil === 0 ? "¡Hoy!" : daysUntil === 1 ? "Mañana" : `En ${daysUntil} días`}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-3xl sm:text-4xl font-black text-green-400">
              {format(new Date(nextMatch.date), "dd", { locale: es })}
            </div>
            <div className="text-sm sm:text-base text-white/80 font-semibold">
              {format(new Date(nextMatch.date), "MMM", { locale: es })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <Clock className="w-5 h-5 text-Primary flex-shrink-0" />
            <div>
              <div className="text-xs text-white/60">Horario</div>
              <div className="text-sm sm:text-base font-bold text-white">{nextMatch.schedule}</div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
            <MapPin className="w-5 h-5 text-Primary flex-shrink-0" />
            <div>
              <div className="text-xs text-white/60">Cancha</div>
              <div className="text-sm sm:text-base font-bold text-white truncate">
                {nextMatch.court.name}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3 sm:col-span-2">
            <Building2 className="w-5 h-5 text-Primary flex-shrink-0" />
            <div>
              <div className="text-xs text-white/60">Complejo</div>
              <div className="text-sm sm:text-base font-bold text-white truncate">
                {nextMatch.complex?.name || "Complejo"}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {nextMatch.status === "PENDIENTE" && nextMatch.paymentUrl && (
            <Button
              className="w-full sm:flex-1 bg-Success hover:bg-Success-dark text-white border border-Success/20"
              onClick={() => (window.location.href = nextMatch.paymentUrl!)}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Continuar Pago
            </Button>
          )}
          <Button className="w-full sm:flex-1 bg-Primary/10 hover:bg-Primary/20 text-Primary border border-Primary/20">
            <MapPin className="w-4 h-4 mr-2" />
            Cómo llegar
          </Button>
          {onCancelBooking && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  className="w-full sm:w-auto bg-Error/20 hover:bg-Error/30 text-Error border border-Error/30"
                >
                  Cancelar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-900 border-white/10 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription className="text-white/70">
                    Esta acción no se puede deshacer. La reserva será cancelada permanentemente.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-white/10">
                    Cancelar
                  </AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-Error hover:bg-Error-dark text-white"
                    onClick={() => onCancelBooking(nextMatch.id)}
                  >
                    Confirmar Cancelación
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </motion.div>

      {/* Other Upcoming Bookings */}
      {reserves.slice(1).map((reserve, index) => (
        <BookingCard key={reserve.id} reserve={reserve} onCancel={onCancelBooking} index={index} />
      ))}
    </div>
  );
};

interface BookingCardProps {
  reserve: Reserve;
  onCancel?: (id: string) => void;
  index: number;
}

const BookingCard = ({ reserve, onCancel, index }: BookingCardProps) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "APROBADO":
        return {
          icon: <CheckCircle2 className="w-4 h-4" />,
          badge: "Confirmado",
          color: "bg-Success/20 text-Success-dark border-Success/30",
        };
      case "PENDIENTE":
        return {
          icon: <AlertCircle className="w-4 h-4" />,
          badge: "Pendiente",
          color: "bg-Warning/20 text-Warning-dark border-Warning/30",
        };
      default:
        return {
          icon: <Clock className="w-4 h-4" />,
          badge: status,
          color: "bg-Info/20 text-Info-dark border-Info/30",
        };
    }
  };

  const statusConfig = getStatusConfig(reserve.status);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden">
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${statusConfig.color} border text-xs`}>
                  {statusConfig.icon}
                  <span className="ml-1">{statusConfig.badge}</span>
                </Badge>
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white mb-1 truncate">
                {reserve.court.name}
              </h4>
              <div className="flex items-center gap-1 text-xs text-white/60 mb-1">
                <Building2 className="w-3 h-3" />
                <span className="truncate">{reserve.complex?.name || "Complejo"}</span>
              </div>
              <p className="text-sm text-white/70">
                {format(new Date(reserve.date), "EEEE, dd 'de' MMMM", { locale: es })}
              </p>
            </div>

            <div className="text-right flex-shrink-0 ml-4">
              <div className="text-2xl sm:text-3xl font-black text-Primary">{reserve.schedule}</div>
            </div>
          </div>

          {/* Footer con acciones */}
          <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-white/10">
            {reserve.status === "PENDIENTE" && reserve.paymentUrl && (
              <Button
                size="sm"
                className="w-full sm:flex-1 bg-Success hover:bg-Success-dark text-white border border-Success/20"
                onClick={() => (window.location.href = reserve.paymentUrl!)}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Pagar
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="w-full sm:flex-1 text-Primary hover:text-Primary-light hover:bg-Primary/10"
            >
              Ver detalles
            </Button>
            {onCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full sm:w-auto text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    Cancelar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-gray-900 border-white/10 text-white">
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                    <AlertDialogDescription className="text-white/70">
                      Esta acción no se puede deshacer. La reserva será cancelada permanentemente.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-white/10 text-white hover:bg-white/20 border-white/10">
                      Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-Error hover:bg-Error-dark text-white"
                      onClick={() => onCancel(reserve.id)}
                    >
                      Confirmar Cancelación
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
