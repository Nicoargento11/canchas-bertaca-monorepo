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
import { scheduleSchema } from "@/schemas/reserve";
import { createSchedule } from "@/services/schedule/schedule";
import { daysOfWeek } from "@/constants";
import { generateTimeOptions } from "@/utils/generateTimeOptions";
import { toast } from "sonner";
import { MultiSelect } from "@/components/ui/multi-select";
import { Complex } from "@/services/complex/complex";
import { formatSportType } from "../courts/cancha-form";
import { SportTypeKey } from "@/services/sport-types/sport-types";
import { useScheduleStore } from "@/store/settings/scheduleStore";
import { useCourtStore } from "@/store/settings/courtStore";
import { useRateStore } from "@/store/settings/rateStore";
import { useSportTypeStore } from "@/store/settings/sportTypeStore";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface ScheduleFormData {
  startTime: string;
  endTime: string;
  days: string[];
  rateId: string;
  courtIds: string[];
  sportTypeId: string;
}

interface ScheduleFormProps {
  complex: Complex;
}

const ScheduleForm = ({ complex }: ScheduleFormProps) => {
  const { addSchedule, initializeSchedules } = useScheduleStore();
  const { courts, initializeCourts } = useCourtStore();
  const { rates, initializeRates } = useRateStore();
  const { sportTypes, initializeSportTypes } = useSportTypeStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    control,
    formState: { errors, isValid },
    reset,
    watch,
    setValue,
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      courtIds: [],
      days: [],
      sportTypeId: "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!complex) return;
    initializeSchedules(complex.schedules);
    initializeCourts(complex.courts);
    initializeRates(complex.rates);
    initializeSportTypes(complex.sportTypes);
  }, [complex]);

  const onSubmit = async (data: ScheduleFormData) => {
    setIsSubmitting(true);
    try {
      if (data.courtIds.length === 0) {
        toast.error("Selecciona al menos una cancha");
        return;
      }

      if (data.days.length === 0) {
        toast.error("Selecciona al menos un día");
        return;
      }

      if (!data.sportTypeId) {
        toast.error("Selecciona un tipo de deporte");
        return;
      }

      const requests = data.courtIds.flatMap((courtId) =>
        data.days.map((scheduleDayId) =>
          createSchedule({
            startTime: data.startTime,
            endTime: data.endTime,
            rateId: data.rateId,
            scheduleDayId,
            courtId,
            complexId: complex.id,
            sportTypeId: data.sportTypeId,
          })
        )
      );

      const responses = await Promise.all(requests);
      const hasError = responses.some((r) => !r.success);

      if (hasError) {
        throw new Error("Error al crear algunos horarios");
      }

      responses.forEach((response) => {
        if (response.data) addSchedule(response.data);
      });

      toast.success(
        `Se crearon ${requests.length} horarios para ${data.courtIds.length} cancha(s)`
      );
      // reset();
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Error al crear horarios");
    } finally {
      setIsSubmitting(false);
    }
  };

  const timeOptions = generateTimeOptions();
  const selectedStartTime = watch("startTime");

  const selectedSportTypeId = watch("sportTypeId");
  const filteredCourts = selectedSportTypeId
    ? courts.filter((court) => court.sportTypeId === selectedSportTypeId)
    : courts;

  return (
    <div className="p-6 bg-white rounded-lg border border-gray-200 shadow-sm">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Agregar Horarios</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configura los horarios disponibles para tus canchas
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Tipo de Deporte */}
          <div className="space-y-2">
            <Label className="text-gray-700">Tipo de Deporte</Label>
            <Controller
              name="sportTypeId"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("courtIds", []);
                  }}
                  value={field.value}
                >
                  <SelectTrigger className="border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Selecciona deporte" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-300">
                    {sportTypes.map((sportType) => (
                      <SelectItem
                        key={sportType.id}
                        value={sportType.id}
                        className="hover:bg-gray-50"
                      >
                        {formatSportType(sportType.name as SportTypeKey)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.sportTypeId && (
              <p className="text-red-500 text-sm mt-1">{errors.sportTypeId.message}</p>
            )}
          </div>

          {/* Tarifa */}
          <div className="space-y-2">
            <Label className="text-gray-700">Tarifa</Label>
            <Controller
              name="rateId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Selecciona tarifa" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-300">
                    {rates.map((rate) => (
                      <SelectItem key={rate.id} value={rate.id} className="hover:bg-gray-50">
                        {rate.name} - ${rate.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.rateId && <p className="text-red-500 text-sm mt-1">{errors.rateId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Hora de inicio */}
          <div className="space-y-2">
            <Label className="text-gray-700">Hora de inicio</Label>
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
                  <SelectTrigger className="border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Selecciona hora" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-300">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time} className="hover:bg-gray-50">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.startTime && (
              <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
            )}
          </div>

          {/* Hora de fin */}
          <div className="space-y-2">
            <Label className="text-gray-700">Hora de fin</Label>
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedStartTime}
                >
                  <SelectTrigger className="border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Selecciona hora" />
                  </SelectTrigger>
                  <SelectContent className="border-gray-300">
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time} className="hover:bg-gray-50">
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.endTime && (
              <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
            )}
          </div>
        </div>

        {/* Canchas */}
        <div className="space-y-2">
          <Label className="text-gray-700">Canchas</Label>
          <Controller
            name="courtIds"
            control={control}
            render={({ field }) => (
              <MultiSelect
                options={filteredCourts.map((court) => ({
                  value: court.id,
                  label: court.name || `Cancha ${court.courtNumber}`,
                }))}
                selected={field.value}
                onChange={field.onChange}
                placeholder="Selecciona canchas"
              />
            )}
          />
          {errors.courtIds && (
            <p className="text-red-500 text-sm mt-1">{errors.courtIds.message}</p>
          )}
        </div>

        {/* Días de la semana */}
        <div className="space-y-2">
          <Label className="text-gray-700">Días de la semana</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {complex.scheduleDays.map((scheduleDay) => (
              <div key={scheduleDay.id} className="flex items-center space-x-2">
                <Controller
                  name="days"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value.includes(scheduleDay.id)}
                      onCheckedChange={(checked) => {
                        const value = scheduleDay.id;
                        return checked
                          ? field.onChange([...field.value, value])
                          : field.onChange(field.value.filter((id) => id !== value));
                      }}
                      className="border-gray-300 data-[state=checked]:bg-gray-800"
                    />
                  )}
                />
                <Label className="text-gray-700">
                  {daysOfWeek.find((day) => day.id === scheduleDay.dayOfWeek)?.name ||
                    `Día ${scheduleDay.dayOfWeek}`}
                </Label>
              </div>
            ))}
          </div>
          {errors.days && <p className="text-red-500 text-sm mt-1">{errors.days.message}</p>}
        </div>

        <Button
          type="submit"
          className="w-full mt-6 bg-gray-800 hover:bg-gray-700"
          disabled={isSubmitting || !isValid}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : (
            "Guardar Horarios"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ScheduleForm;
