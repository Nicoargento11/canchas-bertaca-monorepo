// frontend/services/fixedScheduleService.ts
import api from "../api";
import { Rate } from "../rate/rate";
import { Reserve } from "../reserves/reserves";
import { ScheduleDay } from "../scheduleDay/scheduleDay";

export interface fixedSchedule {
  id: string;
  startTime: string;
  endTime: string;
  court: number;
  scheduleDayId: string;
  rateId: string;
  userId: string;
  isActive: boolean;
  reserves?: Reserve[];
  scheduleDay: ScheduleDay;
  rate: Rate;
  user: { id: string; name: string; email: string };
}

interface sendDataFixedSchedule {
  startTime: string;
  endTime: string;
  court: number;
  scheduleDay: number;
  rate: string;
  user: string;
  isActive: boolean;
}

export const getfixedSchedules = async (): Promise<fixedSchedule[]> => {
  const response = await api.get("/fixed-schedules");
  return response.data;
};

export const getFixedScheduleById = async (
  id: string
): Promise<fixedSchedule> => {
  const response = await api.get(`/fixed-schedules/${id}`);
  return response.data;
};

export const createFixedSchedule = async (
  data: sendDataFixedSchedule
): Promise<fixedSchedule> => {
  const response = await api.post("/fixed-schedules", data);
  return response.data;
};

export const updateFixedSchedule = async (
  id: string,
  data: Partial<sendDataFixedSchedule>
): Promise<fixedSchedule> => {
  const response = await api.put(`/fixed-schedules/${id}`, data);
  return response.data;
};

export const deleteFixedSchedule = async (id: string): Promise<void> => {
  await api.delete(`/fixed-schedules/date/${id}`);
};

export const toggleFixedSchedule = async (
  id: string,
  isActive: boolean
): Promise<fixedSchedule> => {
  const response = await api.put(`/fixed-schedules/${id}/toggle`, { isActive });

  return response.data;
};
