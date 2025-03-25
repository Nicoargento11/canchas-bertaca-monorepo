export const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour <= 24; hour++) {
    const time = `${hour.toString().padStart(2, "0")}:00`;
    times.push(time);
  }
  return times;
};
