export const splitIntoOneHourIntervals = (
  startTime: string,
  endTime: string,
): string[] => {
  const intervals: string[] = [];
  let currentStart = startTime;

  while (currentStart < endTime) {
    // Calcular la hora de fin (una hora después)
    const [currentHour, currentMinute] = currentStart.split(':');
    const nextHour = String(Number(currentHour) + 1).padStart(2, '0');
    const currentEnd = `${nextHour}:${currentMinute}`;

    // Agregar el intervalo al array
    intervals.push(`${currentStart} - ${currentEnd}`);

    // Mover a la siguiente hora
    currentStart = currentEnd;
  }
  intervals.sort((a, b) => {
    const [startA] = a.split(' - ');
    const [startB] = b.split(' - ');
    return startA.localeCompare(startB);
  });

  return intervals;
};
