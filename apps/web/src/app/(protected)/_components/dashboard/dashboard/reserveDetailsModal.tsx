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

const ReserveDetailsModal = () => {
  const { isOpen, handleChangeDetails } = useDashboardDetailsModalStore(
    (state) => state
  );

  const { handleChangeEditReserve } = useDashboardEditReserveModalStore(
    (state) => state
  );

  const { reserve } = useDashboardDataStore((state) => state);
  const { date } = useDashboardDataStore((state) => state);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APROBADO":
        return <Badge className="bg-Success text-white">Aprobado</Badge>;
      case "PENDIENTE":
        return <Badge className="bg-Warning text-white">Pendiente</Badge>;
      case "RECHAZADO":
        return <Badge className="bg-Error text-white">Cancelado</Badge>;
      default:
        return (
          <Badge className="bg-Neutral-dark text-white">Desconocido</Badge>
        );
    }
  };

  const reserveDetails =
    reserve && reserve.User ? (
      <div className="space-y-4">
        {/* Información del Cliente */}
        <Card className="border border-Neutral">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg font-semibold text-Primary-darker">
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="flex items-center gap-4">
              <UserCircle2 className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-black font-medium">Nombre</p>
                <p className="font-medium text-Primary-darker">
                  {reserve.clientName || reserve.User.name}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Mail className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-black font-medium">Email</p>
                <p className="font-medium text-Primary-darker">
                  {reserve.User.email}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Phone className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-black font-medium">Teléfono</p>
                <p className="font-medium text-Primary-darker">
                  {reserve.phone || "No especificado"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalles de la Reserva */}
        <Card className="border border-Neutral">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg font-semibold text-Primary-darker">
              Detalles de la Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
            <div className="flex items-center gap-4">
              <CalendarDays className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-black font-medium">Fecha</p>
                <p className="font-medium text-Primary-darker">
                  {format(new Date(date), "PPP")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Clock9 className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-black font-medium">Horario</p>
                <p className="font-medium text-Primary-darker">
                  {reserve.schedule}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Icon iconNode={soccerPitch} className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-black font-medium">Cancha</p>
                <p className="font-medium text-Primary-darker">
                  Cancha {reserve.court}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <AlertCircle className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-black font-medium">Estado</p>
                {getStatusBadge(reserve.status)}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Información de Pago */}
        <Card className="border border-Neutral">
          <CardHeader className="p-4 border-b">
            <CardTitle className="text-lg font-semibold text-Primary-darker">
              Información de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-4">
            <div className="flex items-center gap-4">
              <Coins className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-black font-medium">Seña/Reserva</p>
                <p className="font-medium text-Primary-darker">
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
                <p className="text-sm text-black font-medium">Monto faltante</p>
                <p className="font-medium text-Primary-darker">
                  {(
                    (reserve.price ?? 0) - (reserve.reservationAmount ?? 0)
                  ).toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Receipt className="text-Primary" size={20} />
              <div>
                <p className="text-sm text-black font-medium">Total</p>
                <p className="font-medium text-Primary-darker">
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
      </div>
    ) : (
      <div className="flex justify-center items-center h-32">
        <p className="text-Neutral-dark">Cargando información...</p>
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
