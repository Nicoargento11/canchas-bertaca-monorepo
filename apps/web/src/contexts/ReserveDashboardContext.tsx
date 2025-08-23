"use client";
import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { getReservationsByDay, ReservesByDay } from "@/services/reserve/reserve";
import { Complex } from "@/services/complex/complex";
import { SportType } from "@/services/sport-types/sport-types";

interface ReservationDashboardState {
  reservationsByDay: ReservesByDay;
  loading: boolean;
  selectedDate: string | null;
  currentComplex: Complex | null;
  sportType: SportType | null;
}

interface ReservationDashboardContextType {
  state: ReservationDashboardState;
  setCurrentComplex: (complex: Complex, sportTypes: SportType) => void;
  fetchReservationsByDay: (date: string, complexId: string, sportTypeId?: string) => Promise<void>;
  clearReservations: () => void;
}

const ReservationDashboardContext = createContext<ReservationDashboardContextType | null>(null);

export const ReservationDashboardProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<ReservationDashboardState>({
    reservationsByDay: [],
    loading: false,
    selectedDate: null,
    currentComplex: null,
    sportType: null,
  });

  const setCurrentComplex = (complex: Complex, sportType: SportType) => {
    setState((prev) => ({ ...prev, currentComplex: complex, sportType: sportType }));
  };

  const fetchReservationsByDay = async (date: string, complexId: string, sportTypeId?: string) => {
    setState((prev) => ({ ...prev, loading: true }));

    try {
      const { success, data } = await getReservationsByDay(date, complexId, sportTypeId);

      if (!success || !data) {
        toast.error("Error al obtener las reservas");
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }
      setState({
        ...state,
        reservationsByDay: data,
        loading: false,
        selectedDate: date,
      });
    } catch (error) {
      toast.error("Error al obtener las reservas");
      setState((prev) => ({ ...prev, loading: false }));
    }
  };

  const clearReservations = () => {
    setState({
      reservationsByDay: [],
      loading: false,
      selectedDate: null,
      currentComplex: null,
      sportType: null,
    });
  };

  return (
    <ReservationDashboardContext.Provider
      value={{
        state,
        setCurrentComplex,
        fetchReservationsByDay,
        clearReservations,
      }}
    >
      {children}
    </ReservationDashboardContext.Provider>
  );
};

export const useReservationDashboard = () => {
  const context = useContext(ReservationDashboardContext);
  if (!context) {
    throw new Error("useReservationDashboard must be used within a ReservationDashboardProvider");
  }
  return context;
};
