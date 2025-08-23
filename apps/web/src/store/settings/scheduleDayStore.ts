// stores/schedule-day-store.ts
import { ScheduleDay } from "@/services/schedule-day/schedule-day";
import { create } from "zustand";

interface ScheduleDayState {
  scheduleDays: ScheduleDay[];
  initialized: boolean;

  initializeScheduleDays: (scheduleDays: ScheduleDay[]) => void;
  setScheduleDays: (scheduleDays: ScheduleDay[]) => void;
  addScheduleDay: (scheduleDay: ScheduleDay) => void;
  updateScheduleDay: (id: string, updatedScheduleDay: Partial<ScheduleDay>) => void;
  deleteScheduleDay: (id: string) => void;
  toggleScheduleDayStatus: (id: string) => void;
}

export const useScheduleDayStore = create<ScheduleDayState>((set) => ({
  scheduleDays: [],
  initialized: false,

  initializeScheduleDays: (scheduleDays) =>
    set((state) => ({
      scheduleDays: state.initialized ? state.scheduleDays : scheduleDays,
      initialized: true,
    })),

  setScheduleDays: (scheduleDays) => set({ scheduleDays }),

  addScheduleDay: (scheduleDay) =>
    set((state) => ({
      scheduleDays: [...state.scheduleDays, scheduleDay],
    })),

  updateScheduleDay: (id, updatedScheduleDay) =>
    set((state) => ({
      scheduleDays: state.scheduleDays.map((day) =>
        day.id === id ? { ...day, ...updatedScheduleDay } : day
      ),
    })),

  deleteScheduleDay: (id) =>
    set((state) => ({
      scheduleDays: state.scheduleDays.filter((day) => day.id !== id),
    })),

  toggleScheduleDayStatus: (id) =>
    set((state) => ({
      scheduleDays: state.scheduleDays.map((day) =>
        day.id === id ? { ...day, isActive: !day.isActive } : day
      ),
    })),
}));
