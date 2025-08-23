"use client";

import { startTransition, useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { ScheduleDay, updateScheduleDay } from "@/services/schedule-day/schedule-day";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Complex } from "@/services/complex/complex";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { SportType } from "@/services/sport-types/sport-types";
import { Loader2 } from "lucide-react";

const daysOfWeek = [
  { id: 1, name: "Lunes" },
  { id: 2, name: "Martes" },
  { id: 3, name: "Miércoles" },
  { id: 4, name: "Jueves" },
  { id: 5, name: "Viernes" },
  { id: 6, name: "Sábado" },
  { id: 0, name: "Domingo" },
];

interface AvailableDaysFormProps {
  initialData: ScheduleDay[];
  complex: Complex;
  sportType: SportType;
}

const AvailableDaysForm = ({ initialData, sportType, complex }: AvailableDaysFormProps) => {
  const { setCurrentComplex } = useReservationDashboard();
  const [originalData, setOriginalData] = useState<ScheduleDay[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { control, handleSubmit, setValue } = useForm<{
    availabilities: ScheduleDay[];
  }>();

  useEffect(() => {
    const sortDays = (data: ScheduleDay[]) => {
      return [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    };
    const sortedData = sortDays(initialData);
    setOriginalData(sortedData);
    setCurrentComplex(complex, sportType);
    setValue("availabilities", sortedData);
  }, [initialData, complex, sportType]);

  const onSubmit = async (data: { availabilities: ScheduleDay[] }) => {
    const changedDays = data.availabilities.filter((day, index) => {
      return day.isActive !== originalData[index]?.isActive;
    });

    if (changedDays.length === 0) {
      toast.info("No se detectaron cambios para guardar");
      return;
    }

    setIsSubmitting(true);
    try {
      await startTransition(async () => {
        const updatePromises = changedDays.map((day) =>
          updateScheduleDay(day.id, { isActive: day.isActive })
        );

        await Promise.all(updatePromises);
        setOriginalData(data.availabilities);
        toast.success("Disponibilidad actualizada correctamente");
      });
    } catch (error) {
      console.error("Error updating availability:", error);
      toast.error("Error al actualizar la disponibilidad");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="p-4 sm:p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-800">
          Disponibilidad de días
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Selecciona los días disponibles para {sportType.name.toLowerCase()}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {daysOfWeek.map((day) => {
            const dayData = originalData.find((d) => d.dayOfWeek === day.id);
            return (
              <Controller
                key={day.id}
                name={`availabilities.${day.id}.isActive`}
                control={control}
                render={({ field }) => (
                  <label className="flex items-center space-x-2 sm:space-x-3 p-3 bg-gray-50 rounded-md border border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="border-gray-400 data-[state=checked]:bg-gray-800 flex-shrink-0"
                    />
                    <span className="text-sm sm:text-base text-gray-800 font-medium truncate">
                      {day.name}
                    </span>
                  </label>
                )}
              />
            );
          })}
        </div>

        <Button
          type="submit"
          className="w-full mt-4 sm:mt-6 bg-gray-800 hover:bg-gray-700 text-sm sm:text-base"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Disponibilidad"
          )}
        </Button>
      </form>
    </div>
  );
};

export default AvailableDaysForm;
