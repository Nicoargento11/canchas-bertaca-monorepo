// frontend/services/unavailableDayService.ts
import api from "../api";

export interface UnavailableDay {
  id: string;
  date: Date;
  reason?: string;
}

export const getUnavailableDays = async (): Promise<UnavailableDay[]> => {
  const response = await api.get("/unavailable-days");
  return response.data;
};

export const getUnavailableDayById = async (
  id: string
): Promise<UnavailableDay> => {
  const response = await api.get(`/unavailable-days/${id}`);
  return response.data;
};

export const createUnavailableDay = async (
  data: Omit<UnavailableDay, "id">
): Promise<UnavailableDay> => {
  const response = await api.post("/unavailable-days", data);
  return response.data;
};

export const updateUnavailableDay = async (
  id: string,
  data: Partial<UnavailableDay>
): Promise<UnavailableDay> => {
  const response = await api.put(`/unavailable-days/${id}`, data);
  return response.data;
};

export const deleteUnavailableDay = async (
  id: string | Date
): Promise<void> => {
  await api.delete(`/unavailable-days/date/${id}`);
};
