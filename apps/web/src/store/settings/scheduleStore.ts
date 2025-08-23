// stores/schedule-store.ts
import { Schedule } from "@/services/schedule/schedule";
import { create } from "zustand";

interface ScheduleState {
  schedules: Schedule[];
  initialized: boolean;

  initializeSchedules: (schedules: Schedule[]) => void;
  setSchedules: (schedules: Schedule[]) => void;
  addSchedule: (schedule: Schedule) => void;
  updateSchedule: (id: string, updatedSchedule: Partial<Schedule>) => void;
  deleteSchedule: (id: string) => void;
}

export const useScheduleStore = create<ScheduleState>((set) => ({
  schedules: [],
  initialized: false,

  initializeSchedules: (schedules) =>
    set((state) => ({
      schedules: state.initialized ? state.schedules : schedules,
      initialized: true,
    })),

  setSchedules: (schedules) => set({ schedules }),

  addSchedule: (schedule) =>
    set((state) => ({
      schedules: [...state.schedules, schedule],
    })),

  updateSchedule: (id, updatedSchedule) =>
    set((state) => ({
      schedules: state.schedules.map((schedule) =>
        schedule.id === id ? { ...schedule, ...updatedSchedule } : schedule
      ),
    })),

  deleteSchedule: (id) =>
    set((state) => ({
      schedules: state.schedules.filter((schedule) => schedule.id !== id),
    })),
}));
