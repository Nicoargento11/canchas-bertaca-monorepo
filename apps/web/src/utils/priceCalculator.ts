import { Rate } from "@/services/rate/rate";
import { Schedule } from "@/services/schedule/schedule";

interface PricingResult {
  price: number;
  reservationAmount: number;
  rateName: string;
  schedule: string;
  dayOfWeek: number;
  availableCourts: string[]; // Nuevo: IDs de canchas disponibles
}

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Función para verificar si un horario está dentro de otro, considerando cruce de medianoche
const isTimeRangeWithin = (
  requestedStart: number,
  requestedEnd: number,
  scheduleStart: number,
  scheduleEnd: number
): boolean => {
  // Caso normal: el horario del schedule no cruza medianoche
  if (scheduleStart < scheduleEnd) {
    return requestedStart >= scheduleStart && requestedEnd <= scheduleEnd;
  }
  // Caso horario del schedule CRUZA medianoche
  else {
    // El horario solicitado puede estar:
    // 1. Completamente en el primer segmento (ej: 14:00-18:00)
    // 2. Completamente en el segundo segmento (ej: 00:00-02:00)
    // 3. Cruzando medianoche (ej: 23:00-01:00)
    return (
      (requestedStart >= scheduleStart && requestedEnd <= 1440) || // Caso 1
      (requestedStart >= 0 && requestedEnd <= scheduleEnd) || // Caso 2
      (requestedStart >= scheduleStart && requestedEnd <= scheduleEnd + 1440) // Caso 3
    );
  }
};

const priceCalculator = (
  day: Date,
  timeRange: string, // Formato "HH:MM - HH:MM"
  schedules: Schedule[],
  courtId?: string // Opcional: filtrar por cancha específica
): PricingResult | null => {
  try {
    // Validar formato del rango horario
    if (!timeRange.includes(" - ") || timeRange.split(" - ").length !== 2) {
      throw new Error("Formato de horario inválido. Use 'HH:MM - HH:MM'");
    }

    const dayOfWeek = day.getDay();
    const [startTime, endTime] = timeRange.split(" - ").map((t) => t.trim());
    const selectedStartMinutes = timeToMinutes(startTime);
    const selectedEndMinutes = timeToMinutes(endTime);

    // Helper para filtrar schedules
    const getMatchingSchedules = (requireSpecificCourt: boolean) => {
      return schedules.filter((s) => {
        const scheduleStartMinutes = timeToMinutes(s.startTime);
        const scheduleEndMinutes = timeToMinutes(s.endTime);

        const matchesDay = s.scheduleDay?.dayOfWeek === dayOfWeek && s.scheduleDay.isActive;
        const matchesTime = isTimeRangeWithin(
          selectedStartMinutes,
          selectedEndMinutes,
          scheduleStartMinutes,
          scheduleEndMinutes
        );

        if (!matchesDay || !matchesTime) return false;

        if (courtId) {
          // Si buscamos para una cancha específica:
          if (requireSpecificCourt) {
            return s.courtId === courtId; // Debe coincidir ID
          } else {
            return !s.courtId; // Debe ser genérico (null)
          }
        }

        return true; // Si no hay courtId, traemos todo
      });
    };

    // 1. Intentar buscar schedules específicos para la cancha
    let matchingSchedules = getMatchingSchedules(true);

    // 2. Si no hay específicos y se pidió una cancha, buscar genéricos
    if (matchingSchedules.length === 0 && courtId) {
      matchingSchedules = getMatchingSchedules(false);
    }

    if (matchingSchedules.length === 0) {
      console.warn(
        `No se encontraron horarios activos para ${timeRange} en día ${dayOfWeek} (Cancha: ${courtId || "Cualquiera"})`
      );
      return null;
    }

    // Obtener todas las tarifas disponibles de todos los schedules coincidentes
    const allRates = matchingSchedules.flatMap((s) => s.rates || []);

    if (allRates.length === 0) {
      console.warn(`Los horarios encontrados no tienen tarifas configuradas`);
      return null;
    }

    // Seleccionar la tarifa (puede implementar lógica más compleja aquí)
    const rate = selectRate(allRates);
    // Obtener canchas disponibles (opcional)
    const availableCourts = matchingSchedules
      .map((s) => s.courtId)
      .filter((id): id is string => !!id); // Filtra valores undefined

    return {
      price: rate.price,
      reservationAmount: rate.reservationAmount,
      rateName: rate.name,
      schedule: timeRange,
      dayOfWeek,
      availableCourts, // Nuevo: lista de canchas disponibles
    };
  } catch (error) {
    console.error("Error en priceCalculator:", error);
    return null;
  }
};

// Función mejorada para seleccionar tarifas entre múltiples opciones
const selectRate = (rates: Rate[]): Rate => {
  // Aquí puedes implementar lógica más sofisticada:
  // - Priorizar tarifas especiales
  // - Usar el promedio si hay múltiples tarifas
  // - Filtrar por algún criterio

  // Ejemplo: tomar la tarifa más baja
  return rates.reduce((lowest, current) => (current.price < lowest.price ? current : lowest));
};

export default priceCalculator;
