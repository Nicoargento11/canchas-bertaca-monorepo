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
} from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";

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
  const reserveDetails =
    reserve && reserve.User ? (
      <div className="flex flex-col gap-2">
        <ul className=" pl-6 text-gray-900">
          <li className="flex items-center gap-4 font-semibold">
            <UserCircle2 className="text-Primary-dark" size={25} />
            <span className="text-lg">
              {reserve.clientName ? reserve.clientName : reserve.User.name}
            </span>
          </li>
          <li className="flex items-center gap-4 font-semibold">
            <Mail className="text-Primary-dark" size={25} />
            <span className="text-lg">{reserve.User.email}</span>
          </li>
          <li className="flex items-center gap-4 font-semibold">
            <Phone className="text-Primary-dark" size={25} />
            <span className="text-lg"> {reserve.phone}</span>
          </li>
          <li className="flex items-center gap-4 font-semibold">
            <CalendarDays size={25} className="text-Primary-dark" />
            <span className="text-lg">{format(date, "yyyy-MM-dd")}</span>
          </li>

          <li className="flex items-center gap-4 font-semibold">
            <Clock9 size={25} className="text-Primary-dark" />
            <span className="text-lg">{reserve?.schedule}</span>
          </li>

          <li className="flex items-center gap-4 font-semibold">
            <GiSoccerField className="text-Primary-dark" size={25} />
            <span className="text-lg">Cancha {reserve?.court}</span>
          </li>
          <li className="flex items-center gap-4 font-semibold">
            <Coins className="text-Primary-dark" size={25} />
            <span className="text-lg">
              Reserva{" "}
              {reserve?.reservationAmount.toLocaleString("es-AR", {
                currency: "ARS",
              })}
            </span>
          </li>
          <li className="flex items-center gap-4 font-semibold">
            <Receipt className="text-Primary-dark" size={25} />
            <span className="text-lg">
              Monto faltante{" "}
              {(reserve?.price - reserve.reservationAmount).toLocaleString(
                "es-AR",
                {
                  currency: "ARS",
                }
              )}{" "}
              ({reserve.price})
            </span>
          </li>

          <li className="flex items-center gap-4 font-semibold">
            <AlertCircle className="text-Primary-dark" size={25} />
            <span className="text-lg">
              <p>
                {reserve?.status === "APROBADO"
                  ? "Reserva aprovada"
                  : reserve?.status === "PENDIENTE"
                    ? "Reserva Cancelada"
                    : "Reserva Pendiente"}
              </p>
            </span>
          </li>
        </ul>
        {canEditReservation(new Date(reserve.date)) && (
          <Button
            className="bg-Primary text-base w-full"
            onClick={() => handleChangeEditReserve()}
          >
            Editar Reserva
          </Button>
        )}
      </div>
    ) : (
      <div>loading...</div>
    );

  return (
    <Modal
      title="Informacion de la reserva"
      isOpen={isOpen}
      onClose={handleChangeDetails}
      body={reserveDetails}
    ></Modal>
  );
};

export default ReserveDetailsModal;
