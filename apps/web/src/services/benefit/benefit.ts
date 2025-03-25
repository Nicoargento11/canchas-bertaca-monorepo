// frontend/services/benefitService.ts
import api from "../api";

export interface Benefit {
  id: string;
  clientType: string; // Tipo de cliente (Ej: "Regular", "Premium")
  name: string;
  description?: string;
  condition?: string;
  discount: number;
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
