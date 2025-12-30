import api from "../api";
import axios from "axios";
import { Complex } from "../complex/complex";
import { Court } from "../court/court";
import { Rate } from "../rate/rate";
import { Reserve } from "../reserve/reserve";
import { ScheduleDay } from "../schedule-day/schedule-day";
import { User } from "../user/user";

export type FixedReserve = {
  id: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  scheduleDay: ScheduleDay;
  scheduleDayId: string;
  rate: Rate;
  rateId: string;
  user: User;
  userId: string;
  court: Court;
  courtId: string;
  complex: Complex;
  complexId: string;
  reserves: Reserve[];
  createdAt: string;
  updatedAt: string;
};

export interface FixedReserveData {
  startTime: string;
  endTime: string;
  courtId: string;
  scheduleDayId: string;
  rateId: string;
  userId: string;
  complexId: string;
  isActive?: boolean;
  promotionId?: string;
}

type FixedReserveResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

const handleFixedReserveError = (error: unknown): FixedReserveResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 404) return { success: false, error: message || "Horario fijo no encontrado" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const getFixedReserves = async (
  complexId?: string,
  dayOfWeek?: number
): Promise<FixedReserveResult<FixedReserve[]>> => {
  try {
    const params: any = {};
    if (complexId) params.complexId = complexId;
    if (dayOfWeek !== undefined) params.dayOfWeek = dayOfWeek;

    const response = await api.get("/fixed-reserves", { params });
    return { success: true, data: response.data };
  } catch (error) {
    return handleFixedReserveError(error);
  }
};

export const getFixedReserveById = async (
  id: string
): Promise<FixedReserveResult<FixedReserve>> => {
  try {
    const response = await api.get(`/fixed-reserves/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleFixedReserveError(error);
  }
};

export const getFixedReservesByUser = async (
  userId: string
): Promise<FixedReserveResult<FixedReserve[]>> => {
  try {
    const response = await api.get(`/fixed-reserves/user/${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleFixedReserveError(error);
  }
};

export const createFixedReserve = async (
  data: FixedReserveData
): Promise<FixedReserveResult<FixedReserve>> => {
  try {
    const response = await api.post("/fixed-reserves", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleFixedReserveError(error);
  }
};

export const updateFixedReserve = async (
  id: string,
  data: Partial<FixedReserveData>
): Promise<FixedReserveResult<FixedReserve>> => {
  try {
    const response = await api.put(`/fixed-reserves/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleFixedReserveError(error);
  }
};

export const deleteFixedReserve = async (id: string): Promise<FixedReserveResult> => {
  try {
    const response = await api.delete(`/fixed-reserves/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleFixedReserveError(error);
  }
};

export const toggleFixedReserveStatus = async (
  id: string,
  isActive: boolean
): Promise<FixedReserveResult<FixedReserve>> => {
  try {
    const response = await api.patch(`/fixed-reserves/${id}/toggle-status`, { isActive });
    return { success: true, data: response.data };
  } catch (error) {
    return handleFixedReserveError(error);
  }
};
