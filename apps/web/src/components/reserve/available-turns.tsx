import React, { useEffect, useMemo, useState } from "react";
import { format, isAfter, parse } from "date-fns";
import { es } from "date-fns/locale";
import { SkeletonModal } from "@/components/skeletonModal";
import { useReserve } from "@/contexts/newReserveContext";
import { Complex } from "@/services/complex/complex";
import { CalendarX } from "lucide-react";
import { SportType } from "@/services/sport-types/sport-types";
import { createAdjustedDateTime } from "@/utils/timeValidation";

interface AvailableTurnsProps {
  complex: Complex;
  sportType: SportType;
}

const AvailableTurns = ({ complex, sportType }: AvailableTurnsProps) => {
  const {
    state,
    getCurrentReservation,
    updateReservationForm,
    fetchAvailability,
    goToNextStep,
    setHasAvailableTurns,
  } = useReserve();

  const currentReservation = getCurrentReservation();
  const selectedDate = currentReservation?.form.day;
  const availabilityByDay = currentReservation?.availability.byDay || [];
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability("day", format(selectedDate, "yyyy-MM-dd"));
    }
  }, [selectedDate]);
  // Filtrar horarios disponibles, eliminando los que ya pasaron
  availabilityByDay;
  const filteredAvailability = useMemo(() => {
    if (!selectedDate) return availabilityByDay;

    const today = new Date();
    const isToday = format(selectedDate, "yyyy-MM-dd") === format(today, "yyyy-MM-dd");

    if (!isToday) return availabilityByDay;

    return availabilityByDay.filter((horario) => {
      // Parsear la hora del horario (ej: "09:00 - 10:00" -> extraer "09:00")
      const startTimeStr = horario.schedule.split(" - ")[0];
      const horarioTime = createAdjustedDateTime(today, startTimeStr);

      // Comparar con la hora actual
      return isAfter(horarioTime, currentTime);
    });
  }, [availabilityByDay, selectedDate, currentTime]);

  // Calcular si hay turnos disponibles (con canchas disponibles)
  const hasAvailableTurns = useMemo(() => {
    return filteredAvailability.some((horario) => horario.court.length > 0);
  }, [filteredAvailability]);

  // Actualizar el estado en el contexto cuando cambie la disponibilidad
  useEffect(() => {
    setHasAvailableTurns(hasAvailableTurns);
  }, [hasAvailableTurns, setHasAvailableTurns]);

  if (!currentReservation || !selectedDate || currentReservation.loading) {
    return <SkeletonModal />;
  }

  const handleTimeSelect = (timeRange: string) => {
    updateReservationForm("hour", timeRange);
    goToNextStep();
  };

  return (
    <div className="pt-2">
      <div>
        <div className="text-center mb-6">
          <p className="font-bold text-2xl text-Primary">Turnos disponibles</p>
          <p className="text-lg text-Neutral-dark">
            {format(selectedDate, "d' de 'MMMM", { locale: es })}
          </p>
        </div>

        <ul className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAvailability.length === 0 ? (
            <li className="col-span-full py-10 text-center">
              <div className="max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-Neutral-light">
                <CalendarX className="w-12 h-12 mx-auto text-Primary mb-4" />
                <h3 className="text-lg font-bold text-Primary mb-2">No hay turnos disponibles</h3>
                <p className="text-Neutral-dark mb-4">
                  {format(selectedDate, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")
                    ? "Los turnos para hoy ya han pasado o no hay disponibilidad."
                    : "Lo sentimos, no hay horarios libres para este día."}
                </p>
              </div>
            </li>
          ) : (
            filteredAvailability.map((horario, index) =>
              horario.court.length > 0 ? (
                <li
                  key={index}
                  className={`${
                    currentReservation.form.hour === horario.schedule
                      ? "border-Primary bg-Primary text-white shadow-lg"
                      : "border-Neutral-light bg-white text-Primary hover:bg-Primary-light hover:text-white"
                  } border-2 rounded-xl p-4 text-center cursor-pointer font-bold transition-all duration-200`}
                  onClick={() => handleTimeSelect(horario.schedule)}
                >
                  <div className="flex flex-col justify-center items-center gap-2">
                    <span className="text-lg">{horario.schedule}</span>
                  </div>
                </li>
              ) : null
            )
          )}
        </ul>
      </div>
    </div>
  );
};

export default AvailableTurns;
