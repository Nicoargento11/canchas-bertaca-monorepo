export const converDate = (dateString: string) => {
  const parts = dateString.split("/");
  const formattedDate = `${parts[1]}/${parts[0]}/${parts[2]}`; // Format the string as "MM/dd/yyyy"
  const dateMilliseconds = Date.parse(formattedDate);
  const date = new Date(dateMilliseconds);
  return date;
};
export default converDate;
