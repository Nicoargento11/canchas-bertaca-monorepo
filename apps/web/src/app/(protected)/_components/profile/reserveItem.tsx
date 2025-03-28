import React from "react";
// import worldCup from "@/public/court2.jpg";
import { ReserveDetail } from "./reserveDetail";

import {
  CalendarDays,
  Clock9,
  CheckCircle2,
  Receipt,
  Coins,
  TriangleAlert,
} from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ButtonCancel } from "./buttonCancel";
import { ButtonPayment } from "./buttonPayment";
import { Badge } from "@/components/ui/badge";
import { Reserve } from "@/services/reserves/reserves";
import formatDateUTC from "@/utils/formatDateUtc";

interface ReserveItemProps {
  reserve: Reserve;
  deleteReserve: (id: string) => void;
}
export const ReserveItem = ({ reserve, deleteReserve }: ReserveItemProps) => {
  return (
    <div
      key={reserve.id}
      className="relative flex w-5/6 rounded-lg bg-gray-200 border-b-2 border-r-2 border-gray-300 shadow-lg"
    >
      <div className="h-44 w-36 relative hidden sm:block rounded-xl ">
        {/* <Image
          src={worldCup}
          alt="Backgroundimage"
          fill
          className="rounded-tl-xl rounded-bl-xl"
        /> */}
      </div>

      <div className="flex flex-col justify-between w-full sm:w-9/12 py-4 pl-2">
        <ReserveDetail
          Icon={GiSoccerField}
          label="Cancha"
          value={reserve.court}
        />
        <ReserveDetail
          Icon={CalendarDays}
          label="Fecha"
          value={formatDateUTC(reserve.date)}
        />
        <ReserveDetail Icon={Clock9} label="Horario" value={reserve.schedule} />
        <ReserveDetail
          Icon={Coins}
          label="Seña/Reserva"
          value={`Seña: ${
            reserve.reservationAmount &&
            reserve.reservationAmount.toLocaleString("es-AR", {
              currency: "ARS",
            })
          }`}
        />
        <ReserveDetail
          Icon={Receipt}
          label="Monto Faltante"
          value={`Monto faltante: ${
            reserve.price &&
            (reserve.price - reserve.reservationAmount!).toLocaleString(
              "es-AR",
              {
                currency: "ARS",
              }
            )
          }`}
        />
        {reserve.status === "PENDIENTE" ? (
          <div className="px-2 pt-2 w-full flex justify-end gap-2">
            <ButtonCancel
              reserveId={reserve.id}
              deleteReserve={deleteReserve}
            />
            <ButtonPayment paymentUrl={reserve.paymentUrl!} />
          </div>
        ) : (
          <div className="w-full flex justify-end px-2">
            <Badge
              variant="outline"
              className="w-fit flex  sm:absolute bottom-2 right-2 bg-Primary text-gray-100 font-semibold hover:cursor-default"
            >
              {new Date(reserve.updatedAt).toLocaleTimeString("es-ES", {
                day: "numeric",
                month: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Badge>
          </div>
        )}
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <div className="absolute flex items-center top-2 right-2 gap-2 bg-gray-300 border-r-1 border-b-1 border-gray-400 shadow-lg rounded-full text-black font-semibold py-1 px-2 lg:py-2 lg:px-4">
            {reserve.status === "APROBADO" ? (
              <CheckCircle2 className="text-Primary" size={20} />
            ) : reserve.status === "RECHAZADO" ? (
              <TriangleAlert color="red" size={20} />
            ) : (
              <TriangleAlert color="orange" size={20} />
            )}
            <p className="hidden lg:block">Estado</p>
          </div>
        </TooltipTrigger>
        <TooltipContent className="text-gray-800 font-semibold bg-gray-100">
          <p>
            {reserve.status === "APROBADO"
              ? "Reservado"
              : reserve.status === "RECHAZADO"
                ? "Reserva Cancelada"
                : "Reserva Pendiente"}
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};
