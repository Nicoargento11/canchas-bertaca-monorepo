import { Rate } from "@/services/rate/rate";
import { Schedule } from "@/services/schedule/schedule";

interface PricingResult {
  price: number;
  reservationAmount: number;
  rateName: string;
  schedule: string;
  dayOfWeek: number;
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

const priceCalculator = (
  day: Date,
  timeRange: string, // Formato "HH:MM - HH:MM"
  schedules: Schedule[]
): PricingResult | null => {
  try {
    // 1. Validar formato del rango horario
    if (!timeRange.includes(" - ") || timeRange.split(" - ").length !== 2) {
      throw new Error("Formato de horario inválido. Use 'HH:MM - HH:MM'");
    }

    // 2. Obtener día de la semana (0-6)
    const dayOfWeek = day.getDay();
    const [startTime, endTime] = timeRange.split(" - ");

    const selectedStartMinutes = timeToMinutes(startTime);
    const selectedEndMinutes = timeToMinutes(endTime);

    // 3. Buscar el schedule que coincida con día y horario
    const matchingSchedule = schedules.find((s) => {
      const scheduleStartMinutes = timeToMinutes(s.startTime);
      const scheduleEndMinutes = timeToMinutes(s.endTime);

      return (
        s.scheduleDay.dayOfWeek === dayOfWeek &&
        selectedStartMinutes >= scheduleStartMinutes &&
        selectedEndMinutes <= scheduleEndMinutes &&
        s.scheduleDay.isActive
      );
    });
    if (!matchingSchedule) {
      console.warn(
        `No se encontró horario activo para ${timeRange} en día ${dayOfWeek}`
      );
      return null;
    }

    // 4. Verificar tarifas disponibles
    if (!matchingSchedule.rates || matchingSchedule.rates.length === 0) {
      console.warn(`El horario ${timeRange} no tiene tarifas configuradas`);
      return null;
    }

    // 5. Seleccionar tarifa principal (aquí puedes implementar lógica más compleja si hay múltiples tarifas)
    const rate = selectRate(matchingSchedule.rates);

    return {
      price: rate.price,
      reservationAmount: rate.reservationAmount,
      rateName: rate.name,
      schedule: `${matchingSchedule.startTime} - ${matchingSchedule.endTime}`,
      dayOfWeek: matchingSchedule.scheduleDay.dayOfWeek,
    };
  } catch (error) {
    console.error("Error en priceCalculator:", error);
    return null;
  }
};

const selectRate = (rates: Rate[]) => {
  // Aquí puedes implementar lógica para seleccionar entre múltiples tarifas
  // Ejemplo: buscar tarifa especial, promocional, etc.
  return rates[0]; // Por defecto toma la primera
};

export default priceCalculator;
