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
import { fixedScheduleSchema } from "@/schemas/reserve";
import { useEffect, useState } from "react";
import { createFixedReserve } from "@/services/fixed-reserve/fixed-reserve";
import { createUser, SendDataUser, User } from "@/services/user/user";
import UserSearch from "../userSearch";
import { useRouter } from "next/navigation";
import { generateTimeOptions } from "@/utils/generateTimeOptions";
import { filterValidEndTimeOptions } from "@/utils/timeValidation";
import { toast } from "sonner";
import { Complex } from "@/services/complex/complex";
import { Loader2 } from "lucide-react";
import { useRateStore } from "@/store/settings/rateStore";
import { useCourtStore } from "@/store/settings/courtStore";
import { useScheduleDayStore } from "@/store/settings/scheduleDayStore";
import { MultiSelect } from "@/components/ui/multi-select";

interface FixedScheduleFormData {
  userId: string;
  startTime: string;
  endTime: string;
  rateId: string;
  courtId: string;
  scheduleDayIds: string[]; // ahora es un array
}

interface FixedScheduleFormProps {
  complex: Complex;
  usersData: User[] | undefined;
}

function getDayName(dayOfWeek: number): string {
  const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return days[dayOfWeek] || `Día ${dayOfWeek}`;
}

const FixedScheduleForm = ({ complex, usersData }: FixedScheduleFormProps) => {
  const { rates, initializeRates } = useRateStore();
  const { courts, initializeCourts } = useCourtStore();
  const { scheduleDays, initializeScheduleDays } = useScheduleDayStore();
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  useEffect(() => {
    setUsers(usersData || []);
    initializeRates(complex.rates);
    initializeCourts(complex.courts);
    initializeScheduleDays(complex.scheduleDays);
  }, [usersData, complex.rates, complex.courts, complex.scheduleDays]);

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
  };

  const validateUserData = (userData: SendDataUser): boolean => {
    if (!userData.name || !userData.email) {
      toast.error("Nombre y email son requeridos");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      toast.error("Por favor ingresa un email válido");
      return false;
    }

    if (users.some((u) => u.email === userData.email)) {
      toast.error("Ya existe un usuario con este email");
      return false;
    }

    return true;
  };

  const handleCreateUser = async (newUser: SendDataUser) => {
    if (!validateUserData(newUser)) return;

    setIsCreatingUser(true);
    try {
      const { success, error, data: userCreated } = await createUser(newUser);

      if (!success || !userCreated) {
        toast.error(error || "Error al crear el usuario");
        return;
      }

      setUsers((prev) => [...prev, userCreated]);
      setSelectedUser(userCreated);
      toast.success("Usuario creado con éxito");
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Ocurrió un error al crear el usuario");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const {
    handleSubmit,
    control,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
    setValue,
  } = useForm<FixedScheduleFormData>({
    resolver: zodResolver(fixedScheduleSchema),
    defaultValues: { scheduleDayIds: [] },
    mode: "onChange",
  });
  const onSubmit = async (data: FixedScheduleFormData) => {
    if (!selectedUser) {
      toast.error("Debes seleccionar un usuario");
      return;
    }

    if (!data.scheduleDayIds || data.scheduleDayIds.length === 0) {
      toast.error("Selecciona al menos un día");
      return;
    }

    setIsSubmitting(true);
    try {
      const requests = data.scheduleDayIds.map((scheduleDayId) =>
        createFixedReserve({
          startTime: data.startTime,
          endTime: data.endTime,
          rateId: data.rateId,
          courtId: data.courtId,
          scheduleDayId,
          userId: selectedUser.id,
          isActive: true,
          complexId: complex.id,
        })
      );

      const results = await Promise.all(requests);

      // Filtrar solo las respuestas fallidas
      const failedResults = results.filter((result) => !result.success);

      if (failedResults.length > 0) {
        // Extraer todos los mensajes de error únicos
        const errorMessages = [...new Set(failedResults.map((r) => r.error))];

        if (failedResults.length === results.length) {
          // Todos fallaron
          toast.error(`No se pudo crear ningún turno: ${errorMessages.join(", ")}`);
        } else {
          // Algunos fallaron
          toast.error(
            `Se crearon ${results.length - failedResults.length} turnos, pero fallaron ${failedResults.length}: ${errorMessages.join(", ")}`
          );
        }
        return;
      }

      // Verificar advertencias de instancias no creadas (por solapamiento, etc.)
      const warnings = results
        .filter((r) => r.success && r.data?.instanceError)
        .map((r) => r.data?.instanceError);

      if (warnings.length > 0) {
        const uniqueWarnings = [...new Set(warnings)];
        toast.warning(
          `Turnos fijos creados, pero algunas reservas de hoy no se generaron: ${uniqueWarnings.join(", ")}`,
          { duration: 6000 }
        );
      } else {
        toast.success(`Se crearon ${results.length} turnos fijos correctamente`);
      }

      router.refresh();
    } catch (error) {
      console.error("Error inesperado:", error);
      // Esto capturaría errores no controlados por tu API (errores de red, etc.)
      toast.error("Error inesperado al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (selectedUser) {
      setValue("userId", selectedUser.id, { shouldValidate: true });
    }
  }, [selectedUser, setValue]);
  const timeOptions = generateTimeOptions();
  const selectedStartTime = watch("startTime");

  const filteredEndTimeOptions = filterValidEndTimeOptions(timeOptions, selectedStartTime);

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">Agregar Turnos Fijos</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label className="text-gray-700 font-medium">Usuario</Label>
          <UserSearch
            users={users}
            onSelectUser={handleSelectUser}
            onCreateUser={handleCreateUser}
            // isLoading={isCreatingUser}
          />
          {!selectedUser && (
            <p className="text-red-500 text-sm mt-1">Debes seleccionar un usuario</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Hora de inicio</Label>
            <Controller
              name="startTime"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    setValue("endTime", "", { shouldValidate: true });
                  }}
                  value={field.value}
                >
                  <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Selecciona hora" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
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

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Hora de fin</Label>
            <Controller
              name="endTime"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  disabled={!selectedStartTime}
                >
                  <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Selecciona hora" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {filteredEndTimeOptions.map((time) => (
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Tarifa</Label>
            <Controller
              name="rateId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Selecciona tarifa" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
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

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Cancha</Label>
            <Controller
              name="courtId"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger className="bg-white border-gray-300 hover:border-gray-400">
                    <SelectValue placeholder="Selecciona cancha" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-300">
                    {courts.map((court) => (
                      <SelectItem key={court.id} value={court.id} className="hover:bg-gray-50">
                        {court.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.courtId && (
              <p className="text-red-500 text-sm mt-1">{errors.courtId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700 font-medium">Días de la semana</Label>
            <Controller
              name="scheduleDayIds"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={scheduleDays.map((day) => ({
                    value: day.id,
                    label: getDayName(day.dayOfWeek),
                  }))}
                  selected={field.value}
                  onChange={field.onChange}
                  placeholder="Selecciona días"
                />
              )}
            />
            {errors.scheduleDayIds && (
              <p className="text-red-500 text-sm mt-1">{errors.scheduleDayIds.message}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 rounded-lg transition-colors mt-4"
          disabled={!isDirty || !isValid || isSubmitting || !selectedUser}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Guardar Turno Fijo"
          )}
        </Button>
      </form>
    </div>
  );
};

export default FixedScheduleForm;
