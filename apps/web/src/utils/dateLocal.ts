const dateLocal = (): Date => {
  const date = new Date();

  const offset = -3 * 60; // La diferencia de horas en minutos
  const timeZoneDifference = offset * 60 * 1000; // Convertir minutos a milisegundos
  const argentinaTime = new Date(date.getTime() + timeZoneDifference);
  return argentinaTime;
};

export default dateLocal;
