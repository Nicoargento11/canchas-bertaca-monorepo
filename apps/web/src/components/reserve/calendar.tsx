import React, { useMemo, useState } from "react";
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
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useReserve } from "@/contexts/newReserveContext";

interface CalendarProps {
  complexId: string; // ID del complejo
  sportType: string; // Tipo de deporte
  disabledDates?: Date[]; // Fechas bloqueadas
  disabledWeekdays?: number[]; // Días de semana no disponibles
  maxSelectableDays: number; // Límite de días a futuro
}

const Calendar = ({
  complexId,
  sportType,
  disabledDates,
  disabledWeekdays,
  maxSelectableDays,
}: CalendarProps) => {
  const { updateReservationForm, getCurrentReservation, goToNextStep } = useReserve();
  const today = new Date(); // Hora local del cliente CSR
  const [currentMonth, setCurrentMonth] = useState<Date>(today);

  const currentReservation = getCurrentReservation();
  const selectedDate = currentReservation?.form.day || today;

  const nextMonth = () => {
    const nextMonthDate = addMonths(currentMonth, 1);
    if (nextMonthDate <= addMonths(today, 2)) {
      // Permitir ver 2 meses adelante
      setCurrentMonth(nextMonthDate);
    }
  };

  const prevMonth = () => {
    if (currentMonth <= today) {
      return;
    }
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const { days, weekdays } = useMemo(() => {
    const firstDayOfMonth = startOfMonth(currentMonth);
    const startDay = startOfWeek(firstDayOfMonth);
    const lastDayOfMonth = endOfMonth(currentMonth);

    const daysOfWeek = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

    const days = eachDayOfInterval({
      start: startDay,
      end: lastDayOfMonth,
    }).map((date, index) => {
      const isPastDay = date < addDays(today, -1);
      const isFutureLimit = date > addDays(today, maxSelectableDays);
      const isDisabledDate = disabledDates && disabledDates.some((d) => isSameDay(d, date));
      const isDisabledWeekday = disabledWeekdays && disabledWeekdays.includes(getDay(date));
      const isSelected = isSameDay(date, selectedDate);

      const isDayDisabled = isPastDay || isFutureLimit || isDisabledDate || isDisabledWeekday;

      return {
        date,
        isDisabled: isDayDisabled,
        isSelected,
        dayNumber: format(date, "d"),
      };
    });

    return {
      days,
      weekdays: daysOfWeek,
    };
  }, [currentMonth, selectedDate, disabledDates, disabledWeekdays, maxSelectableDays]);

  const handleDateSelect = async (date: Date) => {
    updateReservationForm("day", date);
    goToNextStep();
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-Neutral-light rounded-lg shadow-md">
      {/* Encabezado del calendario */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevMonth}
          disabled={currentMonth <= today}
          className="p-2 rounded-full disabled:opacity-50 text-Primary hover:bg-Primary-light transition"
        >
          <ChevronLeft size={25} strokeWidth={3} />
        </button>

        <h2 className="text-xl font-bold text-Primary">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 rounded-full text-Primary hover:bg-Primary-light transition"
        >
          <ChevronRight size={25} strokeWidth={3} />
        </button>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 gap-2 text-sm font-semibold justify-items-center">
        {weekdays.map((day) => (
          <div key={day} className="text-center w-10 text-Primary">
            {day}
          </div>
        ))}
      </div>

      {/* Días del mes */}
      <div className="grid grid-cols-7 gap-2 justify-items-center">
        {days.map((day, index) => (
          <button
            key={index}
            onClick={() => !day.isDisabled && handleDateSelect(day.date)}
            disabled={day.isDisabled}
            className={`
              w-10 h-10 flex items-center justify-center font-bold rounded-full transition
              ${day.isSelected ? "bg-Accent-1 text-Primary border-2 border-Primary" : ""}
              ${day.isDisabled ? "bg-Neutral-light text-Neutral-dark cursor-not-allowed" : "bg-white hover:bg-Primary-light hover:text-white"}
            `}
          >
            {day.dayNumber}
          </button>
        ))}
      </div>
    </div>
  );
};

export default React.memo(Calendar);
