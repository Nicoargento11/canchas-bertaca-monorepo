// frontend/services/scheduleService.ts
import api from "../api";
import { Benefit } from "../benefit/benefit";
import { Rate } from "../rate/rate";
import { ScheduleDay } from "../scheduleDay/scheduleDay";

export interface Schedule {
  id: string;
  startTime: string;
  endTime: string;
  rates: Rate[];
  scheduleDay: ScheduleDay;
  scheduleDayId: string;
  benefits?: Benefit[];
}

export interface sendDataSchedule {
  startTime: string;
  endTime: string;
  scheduleDay: number;
  rates?: string;
  benefits?: string;
}

export const getSchedules = async (): Promise<Schedule[]> => {
  const response = await api.get("/schedules");
  return response.data;
};

export const getScheduleById = async (id: string): Promise<Schedule> => {
  const response = await api.get(`/schedules/${id}`);
  return response.data;
};

export const createSchedule = async (
  data: sendDataSchedule
): Promise<Schedule> => {
  const response = await api.post("/schedules", data);
  return response.data;
};

export const updateSchedule = async (
  id: string,
  data: sendDataSchedule
): Promise<Schedule> => {
  const response = await api.put(`/schedules/${id}`, data);
  return response.data;
};

export const deleteSchedule = async (id: string): Promise<void> => {
  await api.delete(`/schedules/${id}`);
};
