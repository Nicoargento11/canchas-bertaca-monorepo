"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { Complex } from "@/services/complex/complex";
import { Schedule } from "@/services/schedule/schedule";
import { SportType, SportTypeKey } from "@/services/sport-types/sport-types";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import formatDateUTC from "@/utils/formatDateUtc";
import { format } from "date-fns";
import React, { useEffect, useState } from "react";

interface DashboardPageProps {
  userEmail: string | undefined;
  userId: string | undefined;
  schedules: Schedule[];
  complex: Complex;
  sportType: SportType;
}

const DashboardPage = ({
  complex,
  schedules,
  sportType,
  userEmail,
  userId,
}: DashboardPageProps) => {
  const { fetchReservationsByDay, setCurrentComplex } = useReservationDashboard();
  const { date } = useDashboardDataStore((state) => state);
  const selectedDate = date && format(date, "yyyy-MM-dd");

  useEffect(() => {
    const fetchData = async () => {
      if (selectedDate && complex) {
        await fetchReservationsByDay(selectedDate, complex.id, sportType.id);
        setCurrentComplex(complex, sportType);
      }
    };

    fetchData();
  }, [selectedDate, sportType]);

  return (
    <div className="flex flex-col h-full">
      {/* Header mejorado */}

      {/* Contenido principal */}
      <main className="flex-1 overflow-auto p-6"></main>
    </div>
  );
};

export default DashboardPage;
