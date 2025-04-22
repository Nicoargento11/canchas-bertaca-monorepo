import { BACKEND_URL } from "@/config/constants";
export interface Court {
  id: string;
  name: string;
  reservationAmount: number;
  numberCourts: number;
}
export const getCourtByName = async (name: string): Promise<Court> => {
  const response = await fetch(`${BACKEND_URL}/courts/${name}`).then((res) =>
    res.json()
  );
  return response;
};
