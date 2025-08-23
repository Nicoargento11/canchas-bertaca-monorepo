import { Court } from "@/services/court/court";
import { Schedule } from "@/services/schedule/schedule";

interface AvailableSlot {
  timeRange: string;
  courts: Court[];
}

const getAvailableHours = (dayOfWeek: number, schedules: Schedule[]): AvailableSlot[] => {
  const availableSchedules = schedules.filter(
    (schedule) => schedule.scheduleDay?.dayOfWeek === dayOfWeek
  );

  const timeSlots: Record<string, Court[]> = {};

  availableSchedules.forEach((schedule) => {
    const startDate = new Date(`1970-01-01T${schedule.startTime}:00`);
    let endDate = new Date(`1970-01-01T${schedule.endTime}:00`);

    // Si el horario termina al día siguiente (ej. 14:00 a 02:00)
    if (endDate <= startDate) {
      endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000); // Sumamos 24 horas
    }

    let currentTime = new Date(startDate);

    while (currentTime < endDate) {
      const startTimeString = currentTime.toTimeString().substring(0, 5);

      // Calculamos la siguiente hora
      const nextHour = new Date(currentTime.getTime() + 60 * 60 * 1000);
      const endTimeString = nextHour.toTimeString().substring(0, 5);

      // Formato simple HH:MM - HH:MM para todos los casos
      const timeRange = `${startTimeString} - ${endTimeString}`;

      if (!timeSlots[timeRange]) {
        timeSlots[timeRange] = [];
      }

      if (schedule.court && !timeSlots[timeRange].some((c) => c.id === schedule.courtId)) {
        timeSlots[timeRange].push(schedule.court);
      }

      currentTime = nextHour;
    }
  });

  // Ordenamos los resultados
  const result = Object.entries(timeSlots)
    .map(([timeRange, courts]) => ({
      timeRange,
      courts,
    }))
    .sort((a, b) => {
      // Extraemos la hora de inicio de cada rango
      const aStart = a.timeRange.split(" - ")[0];
      const bStart = b.timeRange.split(" - ")[0];

      // Las horas después de medianoche (00:00, 01:00, etc.) van al final
      if (aStart >= "00:00" && aStart < "06:00" && bStart >= "06:00" && bStart <= "23:00") {
        return 1;
      }
      if (bStart >= "00:00" && bStart < "06:00" && aStart >= "06:00" && aStart <= "23:00") {
        return -1;
      }

      return aStart.localeCompare(bStart);
    });

  return result;
};

export default getAvailableHours;
