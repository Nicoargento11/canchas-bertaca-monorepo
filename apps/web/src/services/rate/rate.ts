import api from "../api";
import axios from "axios";

export type Rate = {
  id: string;
  name: string;
  price: number;
  reservationAmount: number;
  complexId: string;
};

type RateResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

const handleRateError = (error: unknown): RateResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 404) return { success: false, error: message || "Tarifa no encontrada" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const getRates = async (): Promise<RateResult<Rate[]>> => {
  try {
    const response = await api.get("/rates");
    return { success: true, data: response.data };
  } catch (error) {
    return handleRateError(error);
  }
};

export const getRateById = async (id: string): Promise<RateResult<Rate>> => {
  try {
    const response = await api.get(`/rates/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleRateError(error);
  }
};

export const createRate = async (
  data: Omit<Rate, "id" | "schedules" | "FixedSchedule">
): Promise<RateResult<Rate>> => {
  try {
    const response = await api.post("/rates", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleRateError(error);
  }
};

export const updateRateFetch = async (
  id: string,
  data: Partial<Rate>
): Promise<RateResult<Rate>> => {
  try {
    const response = await api.put(`/rates/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleRateError(error);
  }
};

export const deleteRateFetch = async (id: string): Promise<RateResult> => {
  try {
    const response = await api.delete(`/rates/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleRateError(error);
  }
};

export const toggleRateStatus = async (id: string): Promise<RateResult<Rate>> => {
  try {
    const response = await api.patch(`/rates/${id}/toggle-status`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleRateError(error);
  }
};
