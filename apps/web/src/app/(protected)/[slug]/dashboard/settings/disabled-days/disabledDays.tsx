"use client";

import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { createUnavailableDay } from "@/services/unavailable-day/unavailable-day";
import { toast } from "sonner";
import { Complex } from "@/services/complex/complex";
import { useUnavailableDayStore } from "@/store/settings/UnavailableDay";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface DisabledDaysProps {
  complex: Complex;
}

const DisabledDays = ({ complex }: DisabledDaysProps) => {
  const { initializeUnavailableDays, addUnavailableDay, unavailableDays } =
    useUnavailableDayStore();
  const [selectedDates, setSelectedDates] = useState<Date[] | undefined>(undefined);
  const [isProcessing, setIsProcessing] = useState(false);

  // Inicializar días no disponibles
  useEffect(() => {
    initializeUnavailableDays(complex.unavailableDays);
  }, [complex.unavailableDays, initializeUnavailableDays]);

  // Convertir unavailableDays a fechas para comparación
  const disabledDates = unavailableDays.map((day) => new Date(day.date));

  const handleDisableDays = async () => {
    if (!selectedDates || selectedDates.length === 0) {
      toast.warning("Selecciona al menos una fecha");
      return;
    }

    setIsProcessing(true);
    try {
      const newDatesToDisable = selectedDates.filter(
        (selectedDate) =>
          !disabledDates.some(
            (disabledDate) => disabledDate.toDateString() === selectedDate.toDateString()
          )
      );

      if (newDatesToDisable.length === 0) {
        toast.info("Las fechas seleccionadas ya están deshabilitadas");
        setSelectedDates(undefined);
        return;
      }

      const creationPromises = newDatesToDisable.map((date) =>
        createUnavailableDay({
          date,
          complexId: complex.id,
          reason: "Deshabilitado manualmente",
        })
      );

      const responses = await Promise.all(creationPromises);
      const successfulCreations = responses.filter((r) => r.success && r.data);

      if (successfulCreations.length > 0) {
        addUnavailableDay(successfulCreations.map((r) => r.data!));
        toast.success(`${successfulCreations.length} fecha(s) deshabilitada(s)`);
      } else {
        throw new Error("No se pudo deshabilitar ninguna fecha");
      }

      setSelectedDates(undefined);
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error al deshabilitar fechas");
    } finally {
      setIsProcessing(false);
    }
  };

  // Verificar si una fecha está deshabilitada
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || disabledDates.some((d) => d.toDateString() === date.toDateString());
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Deshabilitar Días</h2>
          <p className="text-sm text-gray-500 mt-1">
            Selecciona las fechas que deseas marcar como no disponibles
          </p>
        </div>

        <div className="flex flex-col items-center space-y-6">
          <div className="border border-gray-200 rounded-lg p-2 bg-gray-50">
            <Calendar
              mode="multiple"
              selected={selectedDates}
              onSelect={setSelectedDates}
              className="border-2 border-gray-300 rounded-lg shadow-md p-2 bg-white"
              disabled={isDateDisabled}
              modifiers={{
                disabled: (date) => isDateDisabled(date),
              }}
              modifiersStyles={{
                disabled: {
                  color: "#ef4444",
                  textDecoration: "line-through",
                  background: "#fee2e2",
                },
                selected: {
                  background: "#1f2937",
                  color: "white",
                },
              }}
              classNames={{
                months: "space-y-4",
                month: "space-y-4",
                caption: "flex justify-center pt-1 relative items-center",
                caption_label: "text-lg font-bold text-gray-800",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center",
                nav_button_previous: "absolute left-1",
                nav_button_next: "absolute right-1",
                table: "w-full border-collapse space-y-1",
                head_row: "flex",
                head_cell: "text-gray-600 rounded-md w-9 font-semibold text-sm",
                row: "flex w-full mt-2",
                cell: "text-center p-0 relative [&:has([aria-selected])]:bg-gray-100 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                day: "h-9 w-9 p-0 font-medium rounded-md hover:bg-gray-200 transition-colors",
                day_selected:
                  "bg-gray-800 text-white hover:bg-gray-900 focus:bg-gray-900 font-bold",
                day_today: "bg-gray-100 text-gray-900 font-semibold",
                day_outside: "text-gray-400 opacity-50",
                day_disabled: "text-gray-400 opacity-50",
                day_range_middle: "aria-selected:bg-gray-100 aria-selected:text-gray-900",
                day_hidden: "invisible",
              }}
              components={{
                IconLeft: (props) => <ChevronLeft className="h-4 w-4 text-gray-600" {...props} />,
                IconRight: (props) => <ChevronRight className="h-4 w-4 text-gray-600" {...props} />,
              }}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-gray-800"></div>
            <span className="text-sm text-gray-600">Seleccionadas</span>

            <div className="w-3 h-3 rounded-full bg-red-100 border border-red-300"></div>
            <span className="text-sm text-gray-600">No disponibles</span>
          </div>

          <Button
            onClick={handleDisableDays}
            disabled={!selectedDates || selectedDates.length === 0 || isProcessing}
            className="w-full max-w-xs bg-gray-800 hover:bg-gray-700"
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Procesando...
              </>
            ) : (
              "Deshabilitar fechas"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DisabledDays;
