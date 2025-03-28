import { BACKEND_URL } from "@/config/constants";

export enum PricingType {
  NoLights = "NoLights",
  WithLights = "WithLights",
  HolidayLights = "HolidayLights",
  HolidayNoLights = "HolidayNoLights",
  MidNight = "MidNight",
}

export interface Court {
  id: string;
  name: string;
  reservationAmount: number;
  numberCourts: number;
  pricing: {
    id: string;
    type: PricingType;
    amount: number;
    courtId: string;
  }[];
}
export const getCourtByName = async (name: string): Promise<Court> => {
  const response = await fetch(`${BACKEND_URL}/courts/${name}`).then((res) =>
    res.json()
  );
  console.log(response);
  return response;
};
