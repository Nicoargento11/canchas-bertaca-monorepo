"use client";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Rate } from "@/services/rate/rate";
import { fixedScheduleSchema } from "@/schemas"; // Asegúrate de actualizar el esquema
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { daysOfWeek } from "@/constants";
import { createFixedSchedule } from "@/services/fixed-schedules/fixedSchedules";
import { Court } from "@/services/courts/courts";
import { createUser, SendDataUser, User } from "@/services/users/users";
import UserSearch from "./userSearch";
import { useRouter } from "next/navigation";
import { generateTimeOptions } from "@/utils/generateTimeOptions";

interface FixedScheduleFormData {
  userId: string; // Nuevo campo para el nombre de quien reserva
  startTime: string;
  endTime: string;
  rateId: string;
  court: number;
  scheduleDayId: number;
}

interface FixedScheduleFormProps {
  rates: Rate[];
  court: Court;
  usersData: User[];
}

const FixedScheduleForm = ({
  rates,
  court,
  usersData,
}: FixedScheduleFormProps) => {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    setUsers(usersData);
  }, [usersData]);

  // Función para manejar la selección de un usuario
  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  // Función para manejar la creación de un nuevo usuario
  const handleCreateUser = async (newUser: SendDataUser) => {
    try {
      const userCreated = await createUser(newUser);
      setUsers((prev) => [...prev, userCreated]);
      toast({
        duration: 3000,
        variant: "default",
        title: "¡Excelente!",
        description: "Usuario creado con éxito",
      });
      reset();
      router.refresh();
    } catch {
      toast({
        duration: 3000,
        variant: "destructive",
        title: "¡Ups!",
        description: "Ocurrió un error al crear el usuario",
      });
    }
  };

  const { toast } = useToast();
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<FixedScheduleFormData>({
    resolver: zodResolver(fixedScheduleSchema),
    defaultValues: {},
  });

  const onSubmit = async (data: FixedScheduleFormData) => {
    if (!selectedUser) {
      toast({
        duration: 3000,
        variant: "destructive",
        title: "¡Ups!",
        description: "Debes seleccionar un usuario",
      });
      return;
    }

    try {
      await createFixedSchedule({
        startTime: data.startTime,
        endTime: data.endTime,
        rate: data.rateId,
        court: data.court,
        scheduleDay: data.scheduleDayId,
        user: selectedUser.id,
        isActive: true,
      });

      toast({
        duration: 2000,
        variant: "default",
        title: "¡Excelente!",
        description: "Turno/s fijo/s creado/s con éxito",
      });
      reset();
      router.refresh();
    } catch {
      toast({
        duration: 3000,
        variant: "destructive",
        title: "¡Ups!",
        description: "Ocurrió un error al crear el turno fijo",
      });
    }
  };
  useEffect(() => {
    if (selectedUser) {
      setValue("userId", selectedUser.id); // Actualiza el campo userId en el formulario
    }
  }, [selectedUser, setValue]);

  const timeOptions = generateTimeOptions();
  const selectedStartTime = watch("startTime");
  const filteredEndTimeOptions = timeOptions.filter(
    (time) => !selectedStartTime || time > selectedStartTime
  );

  return (
    <div className="p-8 bg-gradient-to-br from-sky-50 to-blue-50 rounded-xl shadow-lg">
      <h1 className="text-3xl font-bold text-Primary-dark mb-6">
        Agregar Turnos Fijos
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Campo para el nombre de quien reserva */}
        <div className="space-y-2">
          <Label className="text-Primary font-semibold">Usuario</Label>
          <UserSearch
            users={users}
            onSelectUser={handleSelectUser}
            onCreateUser={handleCreateUser}
          />
        </div>

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
                  setValue("endTime", ""); // Reinicia la hora de fin al cambiar la hora de inicio
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
            name="rateId"
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
          {errors.rateId && (
            <p className="text-red-500 text-sm">{errors.rateId.message}</p>
          )}
        </div>

        {/* Selector de cancha */}
        <div className="space-y-2">
          <Label className="text-Primary font-semibold">Cancha</Label>
          <Controller
            name="court"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(Number(value))}
                value={field.value?.toString()}
              >
                <SelectTrigger className="bg-white border-blue-200 hover:border-blue-300">
                  <SelectValue placeholder="Selecciona una cancha" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-200">
                  {Array.from({ length: court.numberCourts }, (_, index) => (
                    <SelectItem
                      key={index + 1}
                      value={`${index + 1}`}
                      className="hover:bg-blue-50"
                    >
                      {`Cancha ${index + 1}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.court && (
            <p className="text-red-500 text-sm">{errors.court.message}</p>
          )}
        </div>

        {/* Selector de días de la semana */}
        <div className="space-y-2">
          <Label className="text-Primary font-semibold">
            Días de la semana
          </Label>
          <Controller
            name="scheduleDayId"
            control={control}
            render={({ field }) => (
              <Select
                onValueChange={(value) => field.onChange(Number(value))} // Convierte a número
                value={field.value?.toString()} // Convierte a string para el Select
              >
                <SelectTrigger className="bg-white border-blue-200 hover:border-blue-300">
                  <SelectValue placeholder="Selecciona el día" />
                </SelectTrigger>
                <SelectContent className="bg-white border-blue-200">
                  {daysOfWeek.map((day) => (
                    <SelectItem
                      key={day.id}
                      value={day.id.toString()} // Pasa el valor como string
                      className="hover:bg-blue-50"
                    >
                      {day.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.scheduleDayId && (
            <p className="text-red-500 text-sm">
              {errors.scheduleDayId.message}
            </p>
          )}
        </div>

        {/* Botón de guardar */}
        <Button
          type="submit"
          className="w-full bg-Complementary hover:bg-Accent-1 text-white font-bold py-2 rounded-lg transition-colors"
        >
          Guardar Turno Fijo
        </Button>
      </form>
    </div>
  );
};

export default FixedScheduleForm;
