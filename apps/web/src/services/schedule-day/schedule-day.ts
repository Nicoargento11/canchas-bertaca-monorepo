import api from "../api";
import axios from "axios";
import { Complex } from "../complex/complex";
import { FixedReserve } from "../fixed-reserve/fixed-reserve";
import { Schedule } from "../schedule/schedule";

export type ScheduleDay = {
  id: string;
  dayOfWeek: number;
  isActive: boolean;
  complex?: Complex | null;
  complexId?: string | null;
  schedules: Schedule[];
  fixedReserves: FixedReserve[];
  createdAt: string;
  updatedAt: string;
};

type ScheduleDayResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

const handleScheduleDayError = (error: unknown): ScheduleDayResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 404)
        return { success: false, error: message || "Día de horario no encontrado" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const getScheduleDays = async (): Promise<ScheduleDayResult<ScheduleDay[]>> => {
  try {
    const response = await api.get("/schedule-days");
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleDayError(error);
  }
};

export const getScheduleDayById = async (id: string): Promise<ScheduleDayResult<ScheduleDay>> => {
  try {
    const response = await api.get(`/schedule-days/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleDayError(error);
  }
};
// data: Omit<ScheduleDay, "id" | "schedules">
export const createScheduleDay = async (
  data: Omit<ScheduleDay, "id" | "schedules" | "fixedReserves" | "createdAt" | "updatedAt">
): Promise<ScheduleDayResult<ScheduleDay>> => {
  try {
    const response = await api.post("/schedule-days", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleDayError(error);
  }
};

export const updateScheduleDay = async (
  id: string,
  data: Partial<ScheduleDay>
): Promise<ScheduleDayResult<ScheduleDay>> => {
  try {
    const response = await api.put(`/schedule-days/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleDayError(error);
  }
};

export const deleteScheduleDay = async (id: string): Promise<ScheduleDayResult> => {
  try {
    const response = await api.delete(`/schedule-days/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleDayError(error);
  }
};

export const toggleScheduleDayStatus = async (
  id: string
): Promise<ScheduleDayResult<ScheduleDay>> => {
  try {
    const response = await api.patch(`/schedule-days/${id}/toggle-status`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleDayError(error);
  }
};
