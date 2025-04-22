// frontend/services/fixedScheduleService.ts
import api from "../api";
import { Rate } from "../rate/rate";
import { Reserve } from "../reserves/reserves";
import { ScheduleDay } from "../scheduleDay/scheduleDay";
import { User } from "../users/users";

export interface FixedSchedule {
  id: string;
  startTime: string; // Format like "08:00"
  endTime: string; // Format like "22:00"
  court: number;
  isActive: boolean;
  scheduleDay: ScheduleDay;
  scheduleDayId: string;
  rate: Rate;
  rateId: string;
  reserves?: Reserve[];
  user: User;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
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

export const getfixedSchedules = async (): Promise<FixedSchedule[]> => {
  const response = await api.get("/fixed-schedules");
  return response.data;
};

export const getFixedScheduleById = async (
  id: string
): Promise<FixedSchedule> => {
  const response = await api.get(`/fixed-schedules/${id}`);
  return response.data;
};

export const createFixedSchedule = async (
  data: sendDataFixedSchedule
): Promise<FixedSchedule> => {
  const response = await api.post("/fixed-schedules", data);
  return response.data;
};

export const updateFixedSchedule = async (
  id: string,
  data: Partial<sendDataFixedSchedule>
): Promise<FixedSchedule> => {
  const response = await api.put(`/fixed-schedules/${id}`, data);
  return response.data;
};

export const deleteFixedSchedule = async (id: string): Promise<void> => {
  await api.delete(`/fixed-schedules/date/${id}`);
};

export const toggleFixedSchedule = async (
  id: string,
  isActive: boolean
): Promise<FixedSchedule> => {
  const response = await api.put(`/fixed-schedules/${id}/toggle`, { isActive });

  return response.data;
};
