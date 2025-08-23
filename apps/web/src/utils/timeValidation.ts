/**
 * Utilidad para validar y filtrar horarios considerando que las horas de madrugada
 * (00:00-05:59) pertenecen al día siguiente
 */

/**
 * Función para comparar horas considerando que las horas de madrugada (00:00-05:59) son del día siguiente
 * @param endTime - Hora de fin a validar
 * @param startTime - Hora de inicio de referencia
 * @returns true si la hora de fin es válida para la hora de inicio dada
 */
export const isValidEndTime = (endTime: string, startTime: string): boolean => {
  if (!startTime) return true;

  const parseHour = (time: string): number => parseInt(time.split(":")[0]);
  const startHour = parseHour(startTime);
  const endHour = parseHour(endTime);

  // Si la hora de inicio es de madrugada (00:00-05:59)
  if (startHour >= 0 && startHour <= 5) {
    // La hora de fin debe ser mayor que la de inicio y también de madrugada
    return endHour > startHour && endHour >= 0 && endHour <= 5;
  }

  // Si la hora de inicio es diurna/nocturna (06:00-23:59)
  if (startHour >= 6 && startHour <= 23) {
    // La hora de fin puede ser:
    // 1. Mayor que la de inicio y en el mismo día (06:00-23:59)
    if (endHour > startHour && endHour >= 6 && endHour <= 23) {
      return true;
    }
    // 2. De madrugada del día siguiente (00:00-05:59) - SIEMPRE válido para horarios nocturnos
    if (endHour >= 0 && endHour <= 5) {
      return true;
    }
  }

  return false;
};

/**
 * Filtra las opciones de tiempo para mostrar solo las horas válidas como hora de fin
 * @param timeOptions - Array de opciones de tiempo disponibles
 * @param startTime - Hora de inicio seleccionada
 * @returns Array filtrado de opciones de tiempo válidas
 */
export const filterValidEndTimeOptions = (timeOptions: string[], startTime: string): string[] => {
  return timeOptions.filter((time) => isValidEndTime(time, startTime));
};

/**
 * Crea una fecha ajustada considerando que las horas de madrugada (00:00-05:59) pertenecen al día siguiente
 * @param baseDate - Fecha base (normalmente hoy)
 * @param timeString - Hora en formato "HH:MM"
 * @returns Fecha ajustada con la hora correcta
 */
export const createAdjustedDateTime = (baseDate: Date, timeString: string): Date => {
  const [hours, minutes] = timeString.split(":").map(Number);

  // Si es horario de madrugada (00:00-05:59), considerarlo como del día siguiente
  if (hours >= 0 && hours < 6) {
    return new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate() + 1,
      hours,
      minutes
    );
  }

  // Horarios normales (06:00-23:59) del mismo día
  return new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hours, minutes);
};
