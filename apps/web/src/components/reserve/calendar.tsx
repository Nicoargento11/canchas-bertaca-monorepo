import React, { useState } from "react";
import {
  eachDayOfInterval,
  addDays,
  format,
  startOfMonth,
  startOfWeek,
  endOfMonth,
  addMonths,
  subMonths,
  getDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useReserve } from "@/contexts/reserveContext";
import { UnavailableDay } from "@/services/unavailableDay/unavailableDay";
import { ScheduleDay } from "@/services/scheduleDay/scheduleDay";

interface CalendarProps {
  unavailableDays: UnavailableDay[];
  scheduleDays: ScheduleDay[];
}

const Calendar = ({ scheduleDays, unavailableDays }: CalendarProps) => {
  const { reserveForm, handleReserveForm } = useReserve();

  const today = new Date(); // Hora local del cliente CSR
  const [currentMonth, setCurrentMonth] = useState<Date>(today);

  // Días de la semana deshabilitados (0 = Domingo, 1 = Lunes, ..., 6 = Sábado)
  const disabledWeekdays = scheduleDays
    .filter((day) => !day.isActive) // Filtra los días de la semana deshabilitados
    .map((day) => day.dayOfWeek);

  // Fechas específicas deshabilitadas
  const disabledDates = unavailableDays.map((date) => new Date(date.date));

  const nextMonth = () => {
    const nextMonthDate = addMonths(currentMonth, 1);
    if (nextMonthDate <= addMonths(today, 1)) {
      setCurrentMonth(nextMonthDate);
    }
  };

  const prevMonth = () => {
    if (currentMonth <= today) {
      return;
    }
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const firstDayOfMonth = startOfMonth(currentMonth);
  const startDay = startOfWeek(firstDayOfMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);

  const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const days = eachDayOfInterval({
    start: startDay,
    end: lastDayOfMonth,
  }).map((date, index) => {
    const isPastDay = date < addDays(today, -1); // Deshabilitar dias anteriores
    // || date > addDays(today, 14);
    // const isCurrentDay = isToday(date);
    const isDisabledDate = disabledDates.some(
      (disabledDate) => disabledDate.toDateString() === date.toDateString()
    ); // Verificar si la fecha está deshabilitada
    const isDisabledWeekday = disabledWeekdays.includes(getDay(date)); // Verificar si el día de la semana está deshabilitado

    const isDayDisabled = isPastDay || isDisabledDate || isDisabledWeekday; // Combinar todas las condiciones de deshabilitación

    return (
      <div
        onClick={
          isDayDisabled ? () => {} : () => handleReserveForm("day", date)
        }
        key={index}
        className={`${
          reserveForm.day.toDateString() === date.toDateString()
            ? "bg-Accent-1 text-Primary border-2 border-Primary" // Día seleccionado
            : isDayDisabled
              ? "bg-Neutral-light text-Neutral-dark cursor-not-allowed" // Días deshabilitados
              : "bg-white text-Primary hover:bg-Primary-light hover:text-white" // Días disponibles
        } flex items-center justify-center w-10 h-10 font-bold rounded-full transition duration-200 ease-in-out cursor-pointer`}
      >
        {format(date, "d")}
      </div>
    );
  });

  const weekdays = daysOfWeek.map((day) => (
    <div key={day} className="text-center font-bold text-Primary w-10">
      {day}
    </div>
  ));

  return (
    <div className="flex flex-col gap-4 p-4 bg-Neutral-light rounded-lg shadow-md">
      {/* Encabezado del calendario */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevMonth}
          className={`p-2 rounded-full ${
            currentMonth <= today
              ? "text-Neutral-dark cursor-not-allowed"
              : "text-Primary hover:bg-Primary-light"
          } transition duration-200 ease-in-out`}
          disabled={currentMonth <= today}
        >
          <ChevronLeft size={25} strokeWidth={3} />
        </button>
        <h2 className="text-xl font-bold text-Primary">
          {format(firstDayOfMonth, "MMMM yyyy", { locale: es })}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 rounded-full text-Primary hover:bg-Primary-light transition duration-200 ease-in-out"
        >
          <ChevronRight size={25} strokeWidth={3} />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 text-sm font-semibold justify-items-center">
        {weekdays}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-2 justify-items-center">{days}</div>
    </div>
  );
};

export default Calendar;
