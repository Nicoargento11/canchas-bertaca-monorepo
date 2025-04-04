import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { SkeletonModal } from "@/components/skeletonModal";
import dayHours from "@/utils/dayHours";
// import beerService from "@/utils/beerService";
// import { CupSoda } from "lucide-react";
import { useReserve } from "@/contexts/reserveContext";
import { fixedSchedule } from "@/services/fixed-schedules/fixedSchedules";
import { Schedule } from "@/services/schedule/schedule";

interface AvailableTurnsProps {
  fixedSchedules: fixedSchedule[];
  schedules: Schedule[];
}
const AvailableTurns = ({ fixedSchedules, schedules }: AvailableTurnsProps) => {
  const {
    reserveForm,
    handleReserveForm,
    getAvailableReservesByDay,
    availableReservesByDay,
  } = useReserve();

  const formatedDay = format(reserveForm.day, "yyyy-MM-dd");

  const [isLoading, setLoading] = useState(true);

  useEffect(() => {
    getAvailableReservesByDay(formatedDay);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Obtener el día de la semana del día seleccionado (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const selectedDayOfWeek = reserveForm.day.getDay();

  // Filtrar los turnos fijos que coincidan con el día de la semana seleccionado
  const fixedSchedulesForDay = fixedSchedules.filter(
    (fixedSchedule) =>
      fixedSchedule.scheduleDay.dayOfWeek === selectedDayOfWeek &&
      fixedSchedule.isActive
  );

  // Obtener los horarios ocupados por turnos fijos
  const fixedScheduleHours = fixedSchedulesForDay.map(
    (fixedSchedule) => fixedSchedule.startTime
  );

  // Obtener los horarios ocupados por reservas normales
  const fullSchedules =
    (availableReservesByDay &&
      availableReservesByDay.filter((turno) => turno.court.length <= 0)) ??
    [];

  return (
    <div className="pt-2">
      {isLoading ? (
        <SkeletonModal />
      ) : (
        reserveForm.day && (
          <div>
            {/* Título y fecha */}
            <div className="text-center mb-6">
              <p className="font-bold text-2xl text-Primary">
                Turnos disponibles
              </p>
              <p className="text-lg text-Neutral-dark">
                {format(reserveForm.day, "d' de 'MMMM", { locale: es })}
              </p>
            </div>

            {/* Lista de turnos */}
            <ul className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {dayHours(selectedDayOfWeek, schedules)
                .filter(
                  (horario) =>
                    !fullSchedules?.find(
                      (turno) => turno.schedule === horario
                    ) && // Filtra horarios ocupados por reservas normales
                    !fixedScheduleHours.includes(horario) // Filtra horarios ocupados por turnos fijos
                )
                .map((horario, index) => (
                  <li
                    key={index}
                    className={`${
                      reserveForm.hour === horario
                        ? "border-Primary bg-Primary text-white shadow-lg"
                        : "border-Neutral-light bg-white text-Primary hover:bg-Primary-light hover:text-white"
                    } border-2 rounded-xl p-4 text-center cursor-pointer font-bold transition-all duration-200 ease-in-out transform hover:scale-105`}
                    onClick={() => handleReserveForm("hour", horario)}
                  >
                    {/* Contenedor de la hora y el icono de cerveza */}
                    <div className="flex flex-col justify-center items-center gap-2">
                      {/* Icono de cerveza */}
                      {/* {beerService(horario) && (
                        <div className="w-8 h-8 bg-Accent-1 rounded-full flex items-center justify-center">
                          <CupSoda
                            color={
                              reserveForm.hour === horario ? "white" : "#096FB1"
                            }
                            size={18}
                          />
                        </div>
                      )} */}

                      {/* Hora del turno */}
                      <span className="text-lg">{horario}</span>
                    </div>

                    {/* Indicador de cerveza (texto) */}
                    {/* {beerService(horario) && (
                      <span className="block text-sm text-Accent-1 mt-1">
                        ¡Cerveza incluida!
                      </span>
                    )} */}
                  </li>
                ))}
            </ul>
          </div>
        )
      )}
    </div>
  );
};

export default AvailableTurns;
