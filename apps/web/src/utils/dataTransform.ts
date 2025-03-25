import { ReservaAgrupada } from "@/types";
import { ReservesWithUser } from "@/types/db";

const dataTransform = (dataOriginal: ReservesWithUser[]): ReservaAgrupada[] => {
  const reservasAgrupadas: Record<string, ReservaAgrupada> = {};

  dataOriginal?.forEach((reserve) => {
    const {
      id,
      date,
      schedule,
      court,
      status,
      User,
      price,
      reservationAmount,
      paymentUrl,
      phone,
      clientName,
    } = reserve;
    const [horaInicio, horaFin] = schedule.split(" - ");
    const key = date;

    if (!reservasAgrupadas[key]) {
      reservasAgrupadas[key] = {
        date,
        appointments: [],
      };
    }

    const turnoExistente = reservasAgrupadas[key].appointments.find(
      (appointment) =>
        appointment.horaInicio === horaInicio && appointment.horaFin === horaFin
    );

    if (turnoExistente) {
      turnoExistente.canchas.push({
        id,
        court,
        status,
        price,
        reservationAmount,
        paymentUrl,
        phone,
        clientName,
        User,
      });
    } else {
      reservasAgrupadas[key].appointments.push({
        horaInicio,
        horaFin,
        canchas: [
          {
            id,
            court,
            status,
            price,
            paymentUrl,
            reservationAmount,
            phone,
            clientName,
            User,
          },
        ],
      });
    }
  });

  const dataFormateada: ReservaAgrupada[] = Object.values(reservasAgrupadas);

  return dataFormateada;
};

export default dataTransform;
