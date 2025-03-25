import dateLocal from "./dateLocal";

const canEditReservation = (reservationDate: Date) => {
  const today = dateLocal();
  // Crear una nueva fecha solo con año, mes y día para la fecha actual
  const todayDateOnly = new Date(
    today.getUTCFullYear(),
    today.getUTCMonth(),
    today.getUTCDate()
  );
  // Crear una nueva fecha solo con año, mes y día para la fecha de la reserva
  const reservationDateOnly = new Date(
    reservationDate.getUTCFullYear(),
    reservationDate.getUTCMonth(),
    reservationDate.getUTCDate()
  );
  // Compara las dos fechas
  return reservationDateOnly >= todayDateOnly;
};

export default canEditReservation;
