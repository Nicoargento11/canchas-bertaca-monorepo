// frontend/services/scheduleDayService.ts
import api from "../api";
import { Schedule } from "../schedule/schedule";

export interface ScheduleDay {
  id: string;
  dayOfWeek: number;
  isActive: boolean;
  schedules: Schedule[];
}

export const getScheduleDays = async (): Promise<ScheduleDay[]> => {
  const response = await api.get("/schedule-days");
  console.log(response);
  return response.data;
};

export const getScheduleDayById = async (id: string): Promise<ScheduleDay> => {
  const response = await api.get(`/schedule-days/${id}`);
  return response.data;
};

export const createScheduleDay = async (
  data: Omit<ScheduleDay, "id">
): Promise<ScheduleDay> => {
  const response = await api.post("/schedule-days", data);
  return response.data;
};

export const updateScheduleDay = async (
  id: string,
  data: Partial<ScheduleDay>
): Promise<ScheduleDay> => {
  const response = await api.put(`/schedule-days/${id}`, data);
  return response.data;
};

export const deleteScheduleDay = async (id: string): Promise<void> => {
  await api.delete(`/schedule-days/${id}`);
};
