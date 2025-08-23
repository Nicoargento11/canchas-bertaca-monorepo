import api from "../api";
import axios from "axios";
import { Complex } from "../complex/complex";
import { Court } from "../court/court";
import { Rate } from "../rate/rate";
import { ScheduleDay } from "../schedule-day/schedule-day";
import { SportType } from "../sport-types/sport-types";

export type Schedule = {
  id: string;
  startTime: string;
  endTime: string;
  scheduleDay: ScheduleDay;
  scheduleDayId: string;
  complex?: Complex | null;
  complexId?: string | null;
  court?: Court | null;
  courtId?: string | null;
  rates: Rate[];
  sportTypeId?: string;
  sportType?: SportType;
  createdAt: string;
  updatedAt: string;
};

export interface SendDataSchedule {
  startTime: string;
  endTime: string;
  scheduleDayId: string;
  rateId: string;
  courtId?: string;
  complexId: string;
  sportTypeId: string;
  benefits?: string[];
}

type ScheduleResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

const handleScheduleError = (error: unknown): ScheduleResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 404) return { success: false, error: message || "Horario no encontrado" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const getSchedules = async (): Promise<ScheduleResult<Schedule[]>> => {
  try {
    const response = await api.get("/schedules");
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleError(error);
  }
};

export const getScheduleById = async (id: string): Promise<ScheduleResult<Schedule>> => {
  try {
    const response = await api.get(`/schedules/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleError(error);
  }
};

export const createSchedule = async (data: SendDataSchedule): Promise<ScheduleResult<Schedule>> => {
  try {
    const response = await api.post("/schedules", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleError(error);
  }
};

export const updateScheduleFetch = async (
  id: string,
  data: SendDataSchedule
): Promise<ScheduleResult<Schedule>> => {
  try {
    const response = await api.put(`/schedules/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleError(error);
  }
};

export const deleteScheduleFetch = async (id: string): Promise<ScheduleResult> => {
  try {
    const response = await api.delete(`/schedules/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleError(error);
  }
};

export const toggleScheduleStatus = async (id: string): Promise<ScheduleResult<Schedule>> => {
  try {
    const response = await api.patch(`/schedules/${id}/toggle-status`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleError(error);
  }
};

export const getSchedulesByDay = async (dayId: string): Promise<ScheduleResult<Schedule[]>> => {
  try {
    const response = await api.get(`/schedules/day/${dayId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleScheduleError(error);
  }
};
