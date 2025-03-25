const formatDateUTC = (dateString: string) => {
  const fecha = new Date(dateString);
  const dia = fecha.getUTCDate().toString().padStart(2, "0");
  const mes = (fecha.getUTCMonth() + 1).toString().padStart(2, "0");
  const year = fecha.getUTCFullYear().toString();
  return `${year}-${mes}-${dia}`;
};

export default formatDateUTC;
