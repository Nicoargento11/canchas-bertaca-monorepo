import { Schedule } from "@/services/schedule/schedule";

const getAvailableHours = (
  dayOfWeek: number,
  schedules: Schedule[]
): string[] => {
  // Filtrar los horarios disponibles para el día específico
  const availableSchedules = schedules.filter(
    (schedule) => schedule.scheduleDay.dayOfWeek === dayOfWeek
  );

  // Array para almacenar todas las horas disponibles
  const allAvailableHours: string[] = [];

  // Generar todas las horas disponibles para el día
  availableSchedules.forEach((schedule) => {
    const currentTime = new Date(`1970-01-01T${schedule.startTime}:00`);
    const endTime = new Date(`1970-01-01T${schedule.endTime}:00`);

    // Agregar horas en intervalos de 1 hora
    while (currentTime < endTime) {
      const startTimeString = currentTime.toTimeString().substring(0, 5); // Formato "HH:MM"
      currentTime.setHours(currentTime.getHours() + 1); // Intervalo de 1 hora
      const endTimeString = currentTime.toTimeString().substring(0, 5); // Formato "HH:MM"
      allAvailableHours.push(`${startTimeString} - ${endTimeString}`);
    }
  });

  // Ordenar las horas disponibles de menor a mayor
  allAvailableHours.sort((a, b) => a.localeCompare(b));

  return allAvailableHours;
};

export default getAvailableHours;
