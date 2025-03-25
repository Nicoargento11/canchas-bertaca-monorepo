"use client";

import { startTransition, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  ScheduleDay,
  updateScheduleDay,
} from "@/services/scheduleDay/scheduleDay";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

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
}

const AvailableDaysForm = ({ initialData }: AvailableDaysFormProps) => {
  const { toast } = useToast();

  const { control, handleSubmit, setValue } = useForm<{
    availabilities: ScheduleDay[];
  }>();

  useEffect(() => {
    const sortDays = (data: ScheduleDay[]) => {
      return [...data].sort((a, b) => a.dayOfWeek - b.dayOfWeek);
    };

    setValue("availabilities", sortDays(initialData));
  }, [initialData, setValue]);

  const onSubmit = (data: { availabilities: ScheduleDay[] }) => {
    for (const day of data.availabilities) {
      startTransition(() => {
        updateScheduleDay(day.id, day);
        toast({
          duration: 3000,
          variant: "default",
          title: "¡Excelente!",
          description: "La disponibilidad de días ha sido actualizada",
        });
      });
    }
  };

  return (
    <div className="p-8  bg-gradient-to-br from-sky-50 to-blue-50  rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-Primary-darker mb-6">
        Disponibilidad de días
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {daysOfWeek.map((day) => (
            <Controller
              key={day.id}
              name={`availabilities.${day.id}.isActive`} // Se usa el id del día
              control={control}
              render={({ field }) => (
                <label className="flex items-center space-x-2 p-3 bg-white border border-Primary-lighter rounded-lg hover:border-Primary-darker transition-colors">
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    className="border-Primary-lighter data-[state=checked]:bg-Primary"
                  />
                  <span className="text-Primary-darker font-medium">
                    {day.name}
                  </span>
                </label>
              )}
            />
          ))}
        </div>
        <Button
          type="submit"
          className="w-full bg-Complementary hover:bg-Accent-1 text-white font-bold py-2 rounded-lg transition-colors"
        >
          Guardar Disponibilidad
        </Button>
      </form>
    </div>
  );
};

export default AvailableDaysForm;
