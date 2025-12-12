"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useReserve } from "@/contexts/newReserveContext";
import { Complex } from "@/services/complex/complex";
import { SportType } from "@/services/sport-types/sport-types";
import { format, addDays, isSameDay, getDay, isAfter } from "date-fns";
import { es } from "date-fns/locale";
import Calendar from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface DateTimePickerProps {
  complex: Complex;
  sportType: SportType;
  availabilityOverride?: any[];
  loadingOverride?: boolean;
}

const DateTimePicker = ({
  complex,
  sportType,
  availabilityOverride,
  loadingOverride,
}: DateTimePickerProps) => {
  const { updateReservationForm, getCurrentReservation, fetchAvailability, state } = useReserve();
  const currentReservation = getCurrentReservation();

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];
  const maxDate = addDays(today, 30).toISOString().split("T")[0];

  // Calcular fechas deshabilitadas
  const disabledDates = useMemo(
    () => complex.unavailableDays.map((day) => new Date(day.date)),
    [complex.unavailableDays]
  );

  const disabledWeekdays = useMemo(
    () => complex.scheduleDays.filter((day) => !day.isActive).map((day) => day.dayOfWeek),
    [complex.scheduleDays]
  );

  const getFirstAvailableDate = () => {
    let date = new Date();
    // Try for 60 days
    for (let i = 0; i < 60; i++) {
      const current = addDays(date, i);
      const dayOfWeek = getDay(current);

      const isWeekdayDisabled = disabledWeekdays.includes(dayOfWeek);
      const isDateDisabled = disabledDates.some((d) => isSameDay(d, current));

      if (!isWeekdayDisabled && !isDateDisabled) {
        return format(current, "yyyy-MM-dd");
      }
    }
    return format(date, "yyyy-MM-dd");
  };

  const [selectedDate, setSelectedDate] = useState<string>(getFirstAvailableDate());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  // Obtener disponibilidad del contexto (horarios reales del backend)
  const availabilityByDay = availabilityOverride || currentReservation?.availability?.byDay || [];

  // Filtrar horarios pasados si es hoy
  const filteredAvailability = useMemo(() => {
    const currentTime = new Date();
    const isToday = selectedDate === format(today, "yyyy-MM-dd");

    if (!isToday) return availabilityByDay;

    return availabilityByDay.filter((horario: any) => {
      const startTimeStr = horario.schedule.split(" - ")[0];
      const [hours, minutes] = startTimeStr.split(":").map(Number);
      const horarioTime = new Date(today);
      horarioTime.setHours(hours, minutes, 0, 0);

      return isAfter(horarioTime, currentTime);
    });
  }, [availabilityByDay, selectedDate, today]);

  // Cargar disponibilidad cuando cambia la fecha
  useEffect(() => {
    if (selectedDate && currentReservation) {
      const date = new Date(selectedDate);
      // Ajustar zona horaria para evitar problemas de día anterior
      const userTimezoneOffset = date.getTimezoneOffset() * 60000;
      const adjustedDate = new Date(date.getTime() + userTimezoneOffset);

      updateReservationForm("day", adjustedDate);
      fetchAvailability("day", selectedDate);
    }
  }, [selectedDate, complex.id]);

  const handleDateSelect = (date: Date) => {
    const dateString = format(date, "yyyy-MM-dd");
    setSelectedDate(dateString);
    setSelectedTime(""); // Reset time cuando cambia fecha
    setIsCalendarOpen(false); // Cerrar el popover al seleccionar
  };

  const handleTimeSelect = (schedule: string) => {
    setSelectedTime(schedule);
    // Actualizar el formulario de reserva con el horario completo (ej: "08:00 - 09:00")
    updateReservationForm("hour", schedule);
  };

  return (
    <div className="space-y-6">
      {/* Selector de Fecha */}
      <div>
        <label className="text-white font-bold text-lg mb-3 block text-center">
          Selecciona la fecha
        </label>
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white h-12 text-lg",
                !selectedDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-3 h-5 w-5" />
              {selectedDate ? (
                format(new Date(selectedDate + "T00:00:00"), "PPP", { locale: es })
              ) : (
                <span>Selecciona una fecha</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-auto p-0 bg-gray-900 border-white/20 text-white"
            align="center"
          >
            <Calendar
              complexId={complex.id}
              sportType={sportType.name}
              disabledDates={disabledDates}
              disabledWeekdays={disabledWeekdays}
              maxSelectableDays={30}
              onDateSelect={handleDateSelect}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Selector de Horario */}
      {currentReservation?.loading || loadingOverride ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-Primary border-t-transparent"></div>
        </div>
      ) : (
        <div>
          <label className="text-white font-bold text-lg mb-3 block">
            Selecciona el horario
            {filteredAvailability.length > 0 && (
              <span className="text-white/60 text-sm ml-2">
                ({filteredAvailability.length} horarios disponibles)
              </span>
            )}
          </label>
          {filteredAvailability.length === 0 ? (
            <div className="bg-white/5 border border-white/20 rounded-xl p-6 text-center">
              <p className="text-white/70">No hay horarios disponibles para esta fecha</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {filteredAvailability.map((horario: any) => {
                const hasAvailableCourts = horario.court && horario.court.length > 0;
                return (
                  <button
                    key={horario.schedule}
                    onClick={() => handleTimeSelect(horario.schedule)}
                    disabled={!hasAvailableCourts}
                    className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                      selectedTime === horario.schedule
                        ? "bg-Primary text-white scale-105 shadow-lg"
                        : hasAvailableCourts
                          ? "bg-white/10 text-white/70 hover:bg-white/20 border border-white/20 hover:scale-105"
                          : "bg-white/5 text-white/30 border border-white/10 cursor-not-allowed"
                    }`}
                  >
                    <span className="block text-sm sm:text-base">{horario.schedule}</span>
                    {hasAvailableCourts && (
                      <span className="block text-xs text-white/50 mt-1">
                        {horario.court.length} {horario.court.length === 1 ? "cancha" : "canchas"}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
