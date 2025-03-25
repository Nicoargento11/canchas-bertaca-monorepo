"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rate } from "@/services/rate/rate";
import { scheduleSchema } from "@/schemas";
import { createSchedule } from "@/services/schedule/schedule";
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { daysOfWeek } from "@/constants";
import { generateTimeOptions } from "@/utils/generateTimeOptions";

interface ScheduleFormData {
  startTime: string;
  endTime: string;
  days: number[];
  rates: string;
}

interface ScheduleFormProps {
  rates: Rate[];
}

const ScheduleForm = ({ rates }: ScheduleFormProps) => {
  const { toast } = useToast();
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
  });

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      const requests = data.days.map((day) =>
        createSchedule({
          startTime: data.startTime,
          endTime: data.endTime,
          rates: data.rates,
          scheduleDay: day,
        })
      );
      await Promise.all(requests);
      reset();
      toast({
        duration: 2000,
        variant: "default",
        title: "¡Excelente!",
        description: "Horario/s creado con éxito",
      });
    } catch {
      toast({
        duration: 3000,
        variant: "destructive",
        title: "¡Ups!",
        description: "Ocurrió un error al crear el horario",
      });
    }
  };

  useEffect(() => {
    const subscription = watch((value) => console.log(value));
    return () => subscription.unsubscribe();
  }, [watch, errors]);

  const timeOptions = generateTimeOptions();
  const selectedStartTime = watch("startTime");
  const filteredEndTimeOptions = generateTimeOptions().filter(
    (time) => !selectedStartTime || time > selectedStartTime
  );

  return (
    <div className="p-8 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-Primary-dark mb-6">
        Agregar Horarios
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Selector de hora de inicio */}
        <div className="space-y-2">
          <Label className="text-Primary font-semibold">Hora de inicio</Label>
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("endTime", "");
                }}
                value={field.value}
              >
                <SelectTrigger className="bg-white border-blue-200 hover:border-blue-300">
                  <SelectValue placeholder="Selecciona la hora de inicio" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-white border-blue-200">
                  {timeOptions.map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      className="hover:bg-blue-50"
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.startTime && (
            <p className="text-red-500 text-sm">{errors.startTime.message}</p>
          )}
        </div>

        {/* Selector de hora de fin */}
        <div className="space-y-2">
          <Label className="text-Primary font-semibold">Hora de fin</Label>
          <Controller
            name="endTime"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={field.onChange}
                value={field.value}
                disabled={!selectedStartTime}
              >
                <SelectTrigger className="bg-white border-blue-200 hover:border-blue-300">
                  <SelectValue placeholder="Selecciona la hora de fin" />
                </SelectTrigger>
                <SelectContent className="max-h-60 overflow-y-auto bg-white border-blue-200">
                  {filteredEndTimeOptions.map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      className="hover:bg-blue-50"
                    >
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.endTime && (
            <p className="text-red-500 text-sm">{errors.endTime.message}</p>
          )}
        </div>

        {/* Selector de tarifa */}
        <div className="space-y-2">
          <Label className="text-Primary font-semibold">Tarifa</Label>
          <Controller
            name="rates"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="bg-white border-blue-200 hover:border-blue-300">
                  <SelectValue placeholder="Selecciona una tarifa" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-200">
                  {rates.map((rate) => (
                    <SelectItem
                      key={rate.id}
                      value={rate.id}
                      className="hover:bg-blue-50"
                    >
                      {rate.name} - ${rate.price}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.rates && (
            <p className="text-red-500 text-sm">{errors.rates.message}</p>
          )}
        </div>

        {/* Selector de días de la semana */}
        <div className="space-y-2">
          <Label className="text-Primary font-semibold">
            Días de la semana
          </Label>
          <div className="grid grid-cols-2 gap-3">
            <Controller
              name="days"
              control={control}
              defaultValue={[]}
              render={({ field }) => (
                <>
                  {daysOfWeek.map((day) => (
                    <div key={day.id} className="flex items-center space-x-2">
                      <Checkbox
                        checked={field.value.includes(day.id)}
                        onCheckedChange={(checked) => {
                          const value = Number(day.id);
                          field.onChange(
                            checked
                              ? [...field.value, value]
                              : field.value.filter((id) => id !== value)
                          );
                        }}
                        className="border-blue-300 data-[state=checked]:bg-Primary"
                      />
                      <span className="text-Primary-darker">{day.name}</span>
                    </div>
                  ))}
                </>
              )}
            />
          </div>
          {errors.days && (
            <p className="text-red-500 text-sm">{errors.days.message}</p>
          )}
        </div>

        {/* Botón de guardar */}
        <Button
          type="submit"
          className="w-full bg-Complementary hover:bg-Accent-1 text-white font-bold py-2 rounded-lg transition-colors"
        >
          Guardar Horarios
        </Button>
      </form>
    </div>
  );
};

export default ScheduleForm;
