export const generateTimeOptions = () => {
  const times = [];
  // De 06:00 a 23:00
  for (let hour = 6; hour <= 23; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    times.push(time);
  }
  // De 00:00 a 04:00 (madrugada)
  for (let hour = 0; hour <= 4; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    times.push(time);
  }
  return times;
};
