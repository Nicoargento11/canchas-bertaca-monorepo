// frontend/services/rateService.ts
import api from "../api";
import { FixedSchedule } from "../fixed-schedules/fixedSchedules";
import { Schedule } from "../schedule/schedule";
export interface Rate {
  id: string;
  name: string;
  price: number;
  reservationAmount: number;
  schedules?: Schedule[];
  FixedSchedule?: FixedSchedule[];
}

export const getRates = async (): Promise<Rate[]> => {
  const response = await api.get("/rates");
  return response.data;
};

export const getRateById = async (id: string): Promise<Rate> => {
  const response = await api.get(`/rates/${id}`);
  return response.data;
};

export const createRate = async (data: Partial<Rate>): Promise<Rate> => {
  const response = await api.post("/rates", data);
  return response.data;
};

export const updateRate = async (
  id: string,
  data: Partial<Rate>
): Promise<Rate> => {
  const response = await api.put(`/rates/${id}`, data);
  return response.data;
};

export const deleteRate = async (id: string): Promise<void> => {
  await api.delete(`/rates/${id}`);
};
