import api from "../api";
import { AxiosError } from "axios";
import { Complex } from "../complex/complex";
import { Court } from "../court/court";

export type UnavailableDay = {
  id: string;
  date: Date;
  reason?: string | null;
  court?: Court | null;
  courtId?: string | null;
  complex?: Complex | null;
  complexId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateUnavailableDayData = Omit<UnavailableDay, "id" | "createdAt" | "updatedAt">;
export type UpdateUnavailableDayData = Partial<UnavailableDay>;

type UnavailableDayResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

const handleUnavailableDayError = (error: unknown): UnavailableDayResult => {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 404)
        return { success: false, error: message || "Día no disponible no encontrado" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const getUnavailableDays = async (): Promise<UnavailableDayResult<UnavailableDay[]>> => {
  try {
    const response = await api.get("/unavailable-days");
    return { success: true, data: response.data };
  } catch (error) {
    return handleUnavailableDayError(error);
  }
};

export const getUnavailableDayById = async (
  id: string
): Promise<UnavailableDayResult<UnavailableDay>> => {
  try {
    const response = await api.get(`/unavailable-days/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleUnavailableDayError(error);
  }
};

export const getUnavailableDayByDate = async (
  date: string
): Promise<UnavailableDayResult<UnavailableDay>> => {
  try {
    const response = await api.get(`/unavailable-days/date/${date}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleUnavailableDayError(error);
  }
};

export const createUnavailableDay = async (
  data: CreateUnavailableDayData
): Promise<UnavailableDayResult<UnavailableDay>> => {
  try {
    const response = await api.post("/unavailable-days", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleUnavailableDayError(error);
  }
};

export const updateUnavailableDay = async (
  id: string,
  data: UpdateUnavailableDayData
): Promise<UnavailableDayResult<UnavailableDay>> => {
  try {
    const response = await api.put(`/unavailable-days/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleUnavailableDayError(error);
  }
};

export const deleteUnavailableDayFetch = async (id: string): Promise<UnavailableDayResult> => {
  try {
    const response = await api.delete(`/unavailable-days/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleUnavailableDayError(error);
  }
};

export const toggleUnavailableDayStatus = async (
  id: string
): Promise<UnavailableDayResult<UnavailableDay>> => {
  try {
    const response = await api.patch(`/unavailable-days/${id}/toggle-status`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleUnavailableDayError(error);
  }
};
