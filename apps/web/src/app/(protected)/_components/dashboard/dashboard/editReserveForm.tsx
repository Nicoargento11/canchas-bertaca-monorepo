"use client";
import { Clock9, CalendarDays, CircleUserRound, Icon, Coins } from "lucide-react";
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
            reservationAmount: reserve.reservationAmount || 0,
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
        <Card className="bg-white/5 border-white/10">
          <CardContent className="space-y-4 pt-4">
            {/* Campo Fecha */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <CalendarDays className="text-Primary" size={20} />
                    Fecha
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full bg-white/5 border-white/10 justify-start pl-3 font-normal text-lg text-white hover:bg-white/10 hover:text-white",
                            !field.value && "text-white/50"
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
                    <PopoverContent
                      className="w-auto p-0 bg-gray-900 border-white/10 text-white"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                        className="bg-gray-900 text-white"
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
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <Clock9 className="text-Primary" size={20} />
                    Horario
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!schedules || isPending}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-lg text-white">
                        {/* Mostrar el horario actual si existe */}
                        <SelectValue placeholder={field.value || "Selecciona un horario"} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                      {schedules && reserve ? (
                        dayHours(new Date(reserve.date).getUTCDay(), schedules).map((hour) => (
                          <SelectItem
                            key={hour.timeRange}
                            value={hour.timeRange}
                            className="focus:bg-white/10 focus:text-white"
                          >
                            {hour.timeRange}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="cargando..." disabled className="text-white/50">
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
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <Icon iconNode={soccerPitch} className="text-Primary" size={20} />
                    Cancha
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isPending || courts.length === 0}
                  >
                    <FormControl>
                      <SelectTrigger className="bg-white/5 border-white/10 text-lg text-white">
                        <SelectValue placeholder="Selecciona una cancha" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-gray-900 border-white/10 text-white">
                      {courts.map((court) => (
                        <SelectItem
                          key={court.id}
                          value={court.id.toString()}
                          className="focus:bg-white/10 focus:text-white"
                        >
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
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <CircleUserRound className="text-Primary" size={20} />
                    Nombre del Cliente
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Nombre completo"
                      className="bg-white/5 border-white/10 text-lg text-white placeholder:text-white/30"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Seña */}
            <FormField
              control={form.control}
              name="reservationAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <Coins className="text-Primary" size={20} />
                    Seña / Reserva
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      disabled={isPending}
                      placeholder="Monto de seña"
                      className="bg-white/5 border-white/10 text-lg text-white placeholder:text-white/30"
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
