import dateLocal from "./dateLocal";

const canEditReservation = (reservationDate: Date) => {
  const today = dateLocal();
  // Crear una nueva fecha solo con año, mes y día para la fecha actual
  const todayDateOnly = new Date(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate());

  // Restar 1 día a la fecha actual para permitir editar hasta un día después
  const oneDayBefore = new Date(todayDateOnly);
  oneDayBefore.setDate(oneDayBefore.getDate() - 1);

  // Crear una nueva fecha solo con año, mes y día para la fecha de la reserva
  const reservationDateOnly = new Date(
    reservationDate.getUTCFullYear(),
    reservationDate.getUTCMonth(),
    reservationDate.getUTCDate()
  );

  // Permitir editar si la reserva es de ayer o posterior
  return reservationDateOnly >= oneDayBefore;
};

export default canEditReservation;
