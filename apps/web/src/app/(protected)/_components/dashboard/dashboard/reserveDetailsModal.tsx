"use client";

import { Button } from "@/components/ui/button";
import {
  Receipt,
  UserCircle2,
  Coins,
  Clock9,
  CalendarDays,
  Mail,
  AlertCircle,
  Phone,
  Icon,
} from "lucide-react";
import { soccerPitch } from "@lucide/lab";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import canEditReservation from "@/utils/canEditReservation";
import { useDashboardDetailsModalStore } from "@/store/reserveDashboardDetailsModalStore";
import { Modal } from "@/components/modals/modal";
import { useDashboardEditReserveModalStore } from "@/store/editReserveDashboardModalStore";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import { format } from "date-fns";
import { SessionPayload } from "@/services/auth/session";
import { deleteReserve } from "@/services/reserve/reserve";
import { startTransition } from "react";
import { toast } from "sonner";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { toggleFixedReserveStatus } from "@/services/fixed-reserve/fixed-reserve";

interface ReserveDetailsModalProps {
  userSession: SessionPayload | null | undefined;
}
const ReserveDetailsModal = ({ userSession }: ReserveDetailsModalProps) => {
  // store modal state
  const { isOpen, handleChangeDetails } = useDashboardDetailsModalStore((state) => state);
  const { handleChangeEditReserve } = useDashboardEditReserveModalStore((state) => state);

  const { fetchReservationsByDay, state } = useReservationDashboard();

  const { reserve, date } = useDashboardDataStore((state) => state);
  const selectedDate = date && format(date, "yyyy-MM-dd");

  const handleDeleteReserve = async (id: string) => {
    startTransition(async () => {
      try {
        // Primero, elimina la reserva
        const deleteData = await deleteReserve(id);

        if (deleteData?.error) {
          toast.error(deleteData.error);
          return; // Detiene la ejecución si hay un error
        }

        if (deleteData?.success) {
          toast.success("La reserva se ha eliminado correctamente");

          // Si es una reserva fija, actualiza su estado
          if (reserve?.fixedReserveId) {
            await toggleFixedReserveStatus(reserve.fixedReserveId, false);
          }

          // Finalmente, actualiza la vista del dashboard
          if (selectedDate && state.currentComplex?.id && state.sportType?.id) {
            await fetchReservationsByDay(selectedDate, state.currentComplex.id, state.sportType.id);
          }

          // Cierra el modal de detalles
          handleChangeDetails();
        }
      } catch (error) {
        toast.error("Ocurrió un error inesperado al eliminar la reserva.");
        console.error("Error deleting reserve:", error);
      }
    });
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APROBADO":
        return <Badge className="bg-Success text-white">Aprobado</Badge>;
      case "PENDIENTE":
        return <Badge className="bg-Warning text-white">Pendiente</Badge>;
      case "RECHAZADO":
        return <Badge className="bg-Error text-white">Cancelado</Badge>;
      default:
        return <Badge className="bg-Neutral-dark text-white">Desconocido</Badge>;
    }
  };

  const reserveDetails =
    reserve && reserve.user ? (
      <div className="space-y-4">
        {/* Información del Cliente */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="p-4 border-b border-white/10 bg-white/5">
            <CardTitle className="text-lg font-semibold text-white">
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="flex items-center gap-4">
              <UserCircle2 className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Nombre</p>
                <p className="font-medium text-white">{reserve.clientName || reserve.user.name}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Email</p>
                <p className="font-medium text-white">{reserve.user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Teléfono</p>
                <p className="font-medium text-white">{reserve.phone || "No especificado"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles de la Reserva */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="p-4 border-b border-white/10 bg-white/5">
            <CardTitle className="text-lg font-semibold text-white">
              Detalles de la Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            {" "}
            <div className="flex items-center gap-4">
              <CalendarDays className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Fecha</p>
                <p className="font-medium text-white">
                  {date ? format(new Date(date), "PPP") : "Fecha no disponible"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Clock9 className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Horario</p>
                <p className="font-medium text-white">{reserve.schedule}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Icon iconNode={soccerPitch} className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Cancha</p>
                <p className="font-medium text-white">Cancha {reserve.court.courtNumber}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AlertCircle className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Estado</p>
                {getStatusBadge(reserve.status)}
              </div>
            </div>
            <div className="flex items-center gap-4 md:col-span-2">
              <CalendarDays className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Fecha de Creación</p>
                <p className="font-medium text-white">
                  {new Date(reserve.createdAt).toLocaleString("es-AR", {
                    timeZone: "America/Argentina/Buenos_Aires",
                    day: "2-digit", // Día en 2 dígitos (ej: "05")
                    month: "2-digit", // Mes en 2 dígitos (ej: "07")
                    year: "numeric", // Año (ej: "2025")
                    hour: "2-digit", // Hora en 2 dígitos (ej: "02" PM)
                    minute: "2-digit", // Minutos (ej: "30")
                    hour12: true, // Formato AM/PM
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Pago */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader className="p-4 border-b border-white/10 bg-white/5">
            <CardTitle className="text-lg font-semibold text-white">Información de Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-4">
              <Coins className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Seña/Reserva</p>
                <p className="font-medium text-white">
                  {(reserve.reservationAmount ?? 0).toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Receipt className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Monto faltante</p>
                <p className="font-medium text-white">
                  {((reserve.price ?? 0) - (reserve.reservationAmount ?? 0)).toLocaleString(
                    "es-AR",
                    {
                      style: "currency",
                      currency: "ARS",
                    }
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Receipt className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-white/60 font-medium">Total</p>
                <p className="font-medium text-white">
                  {(reserve.price ?? 0).toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {canEditReservation(new Date(reserve.date)) && (
          <Button
            className="w-full bg-Primary hover:bg-Primary-dark text-white py-4 text-base font-medium"
            onClick={() => handleChangeEditReserve()}
          >
            Editar Reserva
          </Button>
        )}

        {(userSession?.user.role === "COMPLEJO_ADMIN" ||
          userSession?.user.role === "SUPER_ADMIN") && (
            <Button
              onClick={() => handleDeleteReserve(reserve.id)}
              // disabled={}
              className="w-full bg-Error hover:bg-Error-dark text-white py-4 text-base font-medium"
            >
              Eliminar Reserva
            </Button>
          )}
      </div>
    ) : (
      <div className="flex justify-center items-center h-32">
        <p className="text-white/60">Cargando información...</p>
      </div>
    );

  return (
    <Modal
      title="Detalles de la Reserva"
      isOpen={isOpen}
      onClose={handleChangeDetails}
      body={reserveDetails}
    />
  );
};

export default ReserveDetailsModal;
