import React from "react";
import {
  CalendarDays,
  Clock9,
  CheckCircle2,
  Receipt,
  Coins,
  TriangleAlert,
  MapPin,
  CreditCard,
} from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ButtonCancel } from "./buttonCancel";
import { ButtonPayment } from "./buttonPayment";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import formatDateUTC from "@/utils/formatDateUtc";
import { Reserve } from "@/services/reserve/reserve";
import { ReserveDetail } from "./reserveDetail";

interface ReserveItemProps {
  reserve: Reserve;
  deleteReserve: (id: string) => void;
}

export const ReserveItem = ({ reserve, deleteReserve }: ReserveItemProps) => {
  const statusConfig = {
    APROBADO: {
      icon: <CheckCircle2 className="text-Neutral" size={16} />,
      color: "bg-Success text-white border-Success",
      label: "Confirmado",
      cardBorder: "border-Success/30",
      headerBg: "bg-gradient-to-r from-Success/20 to-Success/10",
    },
    RECHAZADO: {
      icon: <TriangleAlert className="text-Neutral" size={16} />,
      color: "bg-Error text-white border-Error",
      label: "Cancelado",
      cardBorder: "border-Error/30",
      headerBg: "bg-gradient-to-r from-Error/20 to-Error/10",
    },
    PENDIENTE: {
      icon: <Clock9 className="text-Warning" size={16} />,
      color: "bg-Warning text-white border-Warning",
      label: "Pendiente",
      cardBorder: "border-Warning/30",
      headerBg: "bg-gradient-to-r from-Warning/20 to-Warning/10",
    },
    CANCELADO: {
      icon: <TriangleAlert className="text-Error" size={16} />,
      color: "bg-Error text-white border-Error",
      label: "Cancelado",
      cardBorder: "border-Error/30",
      headerBg: "bg-gradient-to-r from-Error/20 to-Error/10",
    },
    COMPLETADO: {
      icon: <CheckCircle2 className="text-Neutral" size={16} />,
      color: "bg-Success text-white border-Success",
      label: "Completado",
      cardBorder: "border-Success/30",
      headerBg: "bg-gradient-to-r from-Success/20 to-Success/10",
    },
  };

  const currentStatus = statusConfig[reserve.status];
  const remainingAmount = reserve.price - (reserve.reservationAmount || 0);

  // Determinar qué información mostrar según el estado
  const showPaymentInfo = ["PENDIENTE", "APROBADO"].includes(reserve.status);
  const showRemainingAmount = reserve.status === "PENDIENTE" && remainingAmount > 0;
  const isCancelled = ["RECHAZADO", "CANCELADO"].includes(reserve.status);

  return (
    <Card
      className={`relative overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 bg-white border-2 ${currentStatus.cardBorder}`}
    >
      {/* Status Header */}
      <CardHeader
        className={`relative p-3 sm:p-4 ${currentStatus.headerBg} border-b-2 border-white/30`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center justify-center p-2 sm:p-3 rounded-xl bg-white/90 shadow-md flex-shrink-0">
              <GiSoccerField className="text-Primary" size={24} />
            </div>
            <div className="min-w-0">
              <h3 className="font-bold text-lg sm:text-xl text-Neutral-dark truncate">
                Cancha {reserve.court.courtNumber || "N/A"}
              </h3>
              <p className="text-xs sm:text-sm text-Neutral-dark/80 font-medium">
                {formatDateUTC(new Date(reserve.date).toUTCString())}
              </p>
            </div>
          </div>

          <Badge
            className={`${currentStatus.color} px-3 sm:px-4 py-1.5 sm:py-2 font-bold text-xs sm:text-sm shadow-lg flex-shrink-0 w-fit`}
          >
            {currentStatus.icon}
            <span className="ml-1 sm:ml-2">{currentStatus.label}</span>
          </Badge>
        </div>
      </CardHeader>

      {/* Content */}
      <CardContent className="p-4 sm:p-6 bg-gradient-to-br from-white to-Neutral-light/20">
        {/* Información principal - siempre visible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <ReserveDetail
            Icon={Clock9}
            label="Horario"
            value={reserve.schedule}
            iconClass="text-Primary"
          />

          <ReserveDetail
            Icon={CalendarDays}
            label="Fecha de reserva"
            value={formatDateUTC(new Date(reserve.date).toUTCString())}
            iconClass="text-Info"
          />
        </div>

        {/* Información financiera - condicional según estado */}
        {showPaymentInfo && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <ReserveDetail
              Icon={Coins}
              label="Seña pagada"
              value={
                reserve.reservationAmount?.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                }) || "$0"
              }
              iconClass="text-Success"
            />

            {showRemainingAmount && (
              <ReserveDetail
                Icon={Receipt}
                label="Monto restante"
                value={remainingAmount.toLocaleString("es-AR", {
                  style: "currency",
                  currency: "ARS",
                })}
                iconClass="text-Warning"
              />
            )}
          </div>
        )}

        {/* Precio total */}
        <div
          className={`p-4 sm:p-5 rounded-xl border-2 shadow-inner ${
            isCancelled
              ? "bg-gradient-to-r from-Error/5 to-Error/10 border-Error/20"
              : "bg-gradient-to-r from-Primary/5 to-Primary/10 border-Primary/20"
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div
                className={`flex items-center justify-center p-2 sm:p-3 rounded-xl shadow-md flex-shrink-0 ${
                  isCancelled ? "bg-Error/20" : "bg-Primary/20"
                }`}
              >
                <CreditCard className={isCancelled ? "text-Error" : "text-Primary"} size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-Neutral-dark/70">
                  {isCancelled ? "Precio de la reserva" : "Precio total"}
                </p>
                <p
                  className={`text-xl sm:text-2xl font-bold ${
                    isCancelled ? "text-Error" : "text-Primary"
                  }`}
                >
                  {reserve.price.toLocaleString("es-AR", {
                    style: "currency",
                    currency: "ARS",
                  })}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              {reserve.status === "PENDIENTE" && remainingAmount > 0 && (
                <div className="text-center sm:text-right bg-white/70 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs text-Warning font-bold uppercase tracking-wide">
                    Pago pendiente
                  </p>
                  <p className="text-xs sm:text-sm text-Neutral-dark/70 font-medium">
                    {(((reserve.reservationAmount || 0) / reserve.price) * 100).toFixed(0)}% pagado
                  </p>
                </div>
              )}

              {isCancelled && (
                <div className="text-center sm:text-right bg-white/70 p-2 sm:p-3 rounded-lg">
                  <p className="text-xs text-Error font-bold uppercase tracking-wide">
                    Reserva cancelada
                  </p>
                  <p className="text-xs sm:text-sm text-Neutral-dark/70 font-medium">Sin cargos</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 pt-4 sm:pt-6 border-t-2 border-Neutral/20 mt-4 sm:mt-6">
          {reserve.status === "PENDIENTE" ? (
            <div className="flex flex-col sm:flex-row gap-3 w-full">
              <ButtonCancel reserveId={reserve.id} deleteReserve={deleteReserve} />
              {reserve.paymentUrl && <ButtonPayment paymentUrl={reserve.paymentUrl} />}
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3 text-Neutral-dark/60">
                <div
                  className={`w-3 h-3 rounded-full flex-shrink-0 ${
                    isCancelled ? "bg-Error/50" : "bg-Primary/50"
                  }`}
                ></div>
                <span className="text-xs sm:text-sm font-medium">
                  Última actualización:{" "}
                  <span className="font-bold">
                    {new Date(reserve.updatedAt).toLocaleString("es-ES", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </span>
              </div>

              <div className="flex justify-end">
                {reserve.status === "COMPLETADO" && (
                  <div className="flex items-center gap-2 text-Success bg-Success/10 px-3 py-2 rounded-lg">
                    <CheckCircle2 size={16} />
                    <span className="text-xs sm:text-sm font-bold">Reserva completada</span>
                  </div>
                )}

                {isCancelled && (
                  <div className="flex items-center gap-2 text-Error bg-Error/10 px-3 py-2 rounded-lg">
                    <TriangleAlert size={16} />
                    <span className="text-xs sm:text-sm font-bold">
                      {reserve.status === "RECHAZADO" ? "Rechazada" : "Cancelada"}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
