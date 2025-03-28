const priceDiscount = (horario: string): boolean => {
  // Dividir el horario en horas de inicio y fin
  const [horaInicio] = horario.split(" - ");

  // Convertir las horas a números enteros
  const horaInicioInt = parseInt(horaInicio.split(":")[0]).toString();
  if (horaInicioInt == "0" || horaInicioInt == "1") return true;

  return false;
};

export default priceDiscount;
