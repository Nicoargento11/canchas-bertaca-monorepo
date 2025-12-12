import React from "react";
import { addDays, getDay, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { useReserve } from "@/contexts/newReserveContext";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";

interface CalendarProps {
  complexId: string;
  sportType: string;
  disabledDates?: Date[];
  disabledWeekdays?: number[];
  maxSelectableDays: number;
  onDateSelect?: (date: Date) => void;
}

const Calendar = ({
  complexId,
  sportType,
  disabledDates,
  disabledWeekdays,
  maxSelectableDays,
  onDateSelect,
}: CalendarProps) => {
  const { updateReservationForm, getCurrentReservation, goToNextStep } = useReserve();
  const today = new Date();
  const currentReservation = getCurrentReservation();
  const selectedDate = currentReservation?.form.day || today;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      if (onDateSelect) {
        onDateSelect(date);
      } else {
        updateReservationForm("day", date);
        goToNextStep();
      }
    }
  };

  // Función para determinar si una fecha está deshabilitada
  const isDateDisabled = (date: Date) => {
    // 1. Deshabilitar días pasados (antes de hoy)
    // Usamos setHours(0,0,0,0) para comparar solo fechas sin horas
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    if (date < todayStart) return true;

    // 2. Deshabilitar días más allá del límite permitido
    if (date > addDays(today, maxSelectableDays)) return true;

    // 3. Deshabilitar fechas específicas bloqueadas
    if (disabledDates && disabledDates.some((d) => isSameDay(d, date))) return true;

    // 4. Deshabilitar días de la semana específicos (0=Domingo, 1=Lunes, etc.)
    if (disabledWeekdays && disabledWeekdays.includes(getDay(date))) return true;

    return false;
  };

  return (
    <div className="flex justify-center p-4 bg-white/5 backdrop-blur-sm rounded-xl shadow-md border border-white/20">
      <ShadcnCalendar
        mode="single"
        selected={selectedDate}
        onSelect={handleDateSelect}
        disabled={isDateDisabled}
        locale={es}
        className="rounded-md border-none text-white"
        classNames={{
          day_selected:
            "bg-Primary text-white hover:bg-Primary hover:text-white focus:bg-Primary focus:text-white",
          day_today: "bg-white/10 text-white font-bold",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-white/10 hover:text-white text-white/80",
          day_disabled:
            "text-white/20 opacity-30 hover:bg-transparent hover:text-white/20 cursor-not-allowed",
          head_cell: "text-white/50 w-9 font-normal text-[0.8rem]",
          caption: "flex justify-center pt-1 relative items-center text-white",
          nav_button:
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white hover:bg-white/10 border-white/20",
        }}
      />
    </div>
  );
};

export default Calendar;
