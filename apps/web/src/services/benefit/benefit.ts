// frontend/services/benefitService.ts
import api from "../api";
import { Schedule } from "../schedule/schedule";

export interface Benefit {
  id: string;
  clientType: string; // "Normal", "Fijo", "+10 reservas", etc.
  name: string;
  description?: string | null;
  condition?: string | null;
  discount: number; // Percentage or fixed amount
  schedules?: Schedule[];
}
export const getBenefits = async (): Promise<Benefit[]> => {
  const response = await api.get("/benefits");
  return response.data;
};

export const getBenefitById = async (id: string): Promise<Benefit> => {
  const response = await api.get(`/benefits/${id}`);
  return response.data;
};

export const createBenefit = async (
  data: Omit<Benefit, "id">
): Promise<Benefit> => {
  const response = await api.post("/benefits", data);
  return response.data;
};

export const updateBenefit = async (
  id: string,
  data: Partial<Benefit>
): Promise<Benefit> => {
  const response = await api.put(`/benefits/${id}`, data);
  return response.data;
};

export const deleteBenefit = async (id: string): Promise<void> => {
  await api.delete(`/benefits/${id}`);
};
