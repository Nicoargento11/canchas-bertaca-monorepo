import api from "../api";
import axios from "axios";
import { Rate } from "../rate/rate";
import { SportType } from "../sport-types/sport-types";

export type Court = {
  id: string;
  name: string;
  courtNumber?: number | null;
  characteristics?: string[];
  isActive: boolean;
  description?: string | null;
  complexId: string;
  sportTypeId?: string;
  sportType: SportType;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

export type CourtResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GenericError {
  status?: number;
  message?: string;
  data?: any;
}

const handleCourtError = (error: unknown): CourtResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 403)
        return { success: false, error: message || "No tiene permisos para esta acción" };
      if (status === 404) return { success: false, error: message || "Cancha no encontrada" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };
      if (status === 400)
        return { success: false, error: error.response.data?.message || "Datos inválidos" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }

  const genericError = error as GenericError;
  if (genericError.status && genericError.message) {
    return {
      success: false,
      error: genericError.message || `Error ${genericError.status}`,
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Error desconocido",
  };
};

export const createCourt = async (data: Partial<Court>): Promise<CourtResult<Court>> => {
  try {
    const response = await api.post("/courts", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCourtError(error);
  }
};

export const getAllCourts = async (complexId?: string): Promise<CourtResult<Court[]>> => {
  try {
    const url = complexId ? `/courts?complexId=${complexId}` : "/courts";
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCourtError(error);
  }
};

export const getPaginatedCourts = async (
  page = 1,
  limit = 10,
  complexId?: string
): Promise<CourtResult<Court[]>> => {
  try {
    const baseUrl = `/courts/paginate?page=${page}&limit=${limit}`;
    const url = complexId ? `${baseUrl}&complexId=${complexId}` : baseUrl;
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCourtError(error);
  }
};

export const getCourtById = async (id: string): Promise<CourtResult<Court>> => {
  try {
    const response = await api.get(`/courts/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCourtError(error);
  }
};

export const updateCourtFetch = async (
  id: string,
  data: Partial<Court>
): Promise<CourtResult<Court>> => {
  try {
    const response = await api.patch(`/courts/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCourtError(error);
  }
};

export const deleteCourtFetch = async (id: string): Promise<CourtResult> => {
  try {
    const response = await api.delete(`/courts/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCourtError(error);
  }
};

export const getCourtsBySportType = async (
  sportTypeId: string,
  complexId?: string
): Promise<CourtResult<Court[]>> => {
  try {
    const baseUrl = `/courts/by-sport-type/${sportTypeId}`;
    const url = complexId ? `${baseUrl}?complexId=${complexId}` : baseUrl;
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCourtError(error);
  }
};

export const getActiveCourts = async (complexId?: string): Promise<CourtResult<Court[]>> => {
  try {
    const baseUrl = "/courts/active";
    const url = complexId ? `${baseUrl}?complexId=${complexId}` : baseUrl;
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCourtError(error);
  }
};

export const toggleCourtStatusFetch = async (id: string): Promise<CourtResult<Court>> => {
  try {
    const response = await api.patch(`/courts/${id}/toggle-status`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCourtError(error);
  }
};
