"use client";
import { Clock9, CalendarDays, CircleUserRound, Icon } from "lucide-react";
import { soccerPitch } from "@lucide/lab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import "react-phone-number-input/style.css";
import { useEffect, useState, useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import dayHours from "@/utils/dayHours";
import { useDashboardDetailsModalStore } from "@/store/reserveDashboardDetailsModalStore";
import { useDashboardEditReserveModalStore } from "@/store/editReserveDashboardModalStore";
import { format } from "date-fns";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import { getSchedules, Schedule } from "@/services/schedule/schedule";
import { Card, CardContent } from "@/components/ui/card";
import { editReserveAdminSchema } from "@/schemas/reserve";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { updateReserve } from "@/services/reserve/reserve";
import { toast } from "sonner";

export const EditReserveForm = () => {
  const [isPending, startTransition] = useTransition();
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);

  const { handleChangeDetails } = useDashboardDetailsModalStore((state) => state);
  const { fetchReservationsByDay, state } = useReservationDashboard();
  const courts =
    state.currentComplex?.courts.filter((court) => court.sportTypeId === state.sportType?.id) || [];

  const { reserve, date } = useDashboardDataStore((state) => state);

  const { handleChangeEditReserve } = useDashboardEditReserveModalStore((state) => state);
  const selectedDate = date && format(date, "yyyy-MM-dd");
  const form = useForm<z.infer<typeof editReserveAdminSchema>>({
    defaultValues:
      reserve && reserve.user && date
        ? {
            courtId: reserve.court.id,
            date: date,
            schedule: reserve.schedule,
            clientName: reserve.clientName || reserve.user.name,
          }
        : undefined,
  });

  const onSubmit = (values: z.infer<typeof editReserveAdminSchema>) => {
    if (!reserve) return;

    startTransition(() => {
      updateReserve(reserve.id, {
        ...values,
        courtId: values.courtId,
        complexId: state.currentComplex?.id,
      }).then((data) => {
        if (data?.success) {
          toast.success("La reserva se ha editado correctamente");
        }
        if (data?.error) {
          toast.error(data.error);
        }
        if (selectedDate) {
          fetchReservationsByDay(selectedDate, state.currentComplex?.id!, state.sportType?.id);
        }
        handleChangeEditReserve();
        handleChangeDetails();
      });
    });
  };
  useEffect(() => {
    if (reserve) {
      const fetchData = async () => {
        try {
          const { data: schedules } = await getSchedules();
          if (schedules) setSchedules(schedules);
        } catch (error) {
          console.error("Error fetching schedules:", error);
        }
      };
      fetchData();
    }
  }, [reserve]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border border-Neutral">
          <CardContent className="space-y-4 pt-4">
            {/* Campo Fecha */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-Neutral-dark">
                    <CalendarDays className="text-Primary" size={20} />
                    Fecha
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full border-Neutral justify-start pl-3 font-normal text-lg",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Horario */}
            <FormField
              control={form.control}
              name="schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-Neutral-dark">
                    <Clock9 className="text-Primary" size={20} />
                    Horario
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!schedules || isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="border-Neutral text-lg">
                        {/* Mostrar el horario actual si existe */}
                        <SelectValue placeholder={field.value || "Selecciona un horario"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {schedules && reserve ? (
                        dayHours(new Date(reserve.date).getUTCDay(), schedules).map((hour) => (
                          <SelectItem key={hour.timeRange} value={hour.timeRange}>
                            {hour.timeRange}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="cargando..." disabled>
                          Cargando horarios...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Cancha */}
            <FormField
              control={form.control}
              name="courtId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-Neutral-dark">
                    <Icon iconNode={soccerPitch} className="text-Primary" size={20} />
                    Cancha
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending || courts.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="border-Neutral text-lg">
                        <SelectValue placeholder="Selecciona una cancha" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {courts.map((court) => (
                        <SelectItem key={court.id} value={court.id.toString()}>
                          Cancha {court.courtNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Nombre del Cliente */}
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-Neutral-dark">
                    <CircleUserRound className="text-Primary" size={20} />
                    Nombre del Cliente
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Nombre completo"
                      className="border-Neutral text-lg"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isPending}
          className="w-full bg-Primary hover:bg-Primary-dark text-white py-4 text-base font-medium"
        >
          {isPending ? "Guardando..." : "Confirmar Cambios"}
        </Button>
      </form>
    </Form>
  );
};
