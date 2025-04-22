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
import { editReserveAdminSchema } from "@/schemas";
import { z } from "zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { editReserve } from "@/services/reserves/reserves";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import { getSchedules, Schedule } from "@/services/schedule/schedule";
import { Card, CardContent } from "@/components/ui/card";
import { useReserve } from "@/contexts/reserveContext";

export const EditReserveForm = () => {
  const [isPending, startTransition] = useTransition();
  const [schedules, setSchedules] = useState<Schedule[] | null>(null);

  const { handleChangeDetails } = useDashboardDetailsModalStore(
    (state) => state
  );
  const { getReservesByDay } = useReserve();
  const { reserve, date } = useDashboardDataStore((state) => state);

  const { handleChangeEditReserve } = useDashboardEditReserveModalStore(
    (state) => state
  );
  const selectedDate = date && format(date, "yyyy-MM-dd");

  const { toast } = useToast();

  const form = useForm<z.infer<typeof editReserveAdminSchema>>({
    defaultValues:
      reserve && reserve.User
        ? {
            court: reserve.court,
            date: new Date(date),
            schedule: reserve.schedule,
            clientName: reserve.clientName || reserve.User.name,
          }
        : undefined,
  });

  const onSubmit = (values: z.infer<typeof editReserveAdminSchema>) => {
    if (!reserve) return;

    startTransition(() => {
      editReserve({
        ...values,
        court: parseInt(values.court.toString()),
        id: reserve.id,
      }).then((data) => {
        if (data?.succes) {
          toast({
            duration: 3000,
            variant: "default",
            title: "¡Excelente!",
            description: data.succes,
          });
        }
        if (data?.error) {
          toast({
            duration: 3000,
            variant: "destructive",
            title: "¡Error!",
            description: data.error,
          });
        }
        getReservesByDay(selectedDate);
        handleChangeEditReserve();
        handleChangeDetails();
      });
    });
  };

  useEffect(() => {
    if (reserve) {
      const fetchData = async () => {
        try {
          const data = await getSchedules();
          setSchedules(data);
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
                        <SelectValue placeholder="Selecciona un horario" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {reserve &&
                        schedules &&
                        dayHours(
                          new Date(reserve.date).getDay(),
                          schedules
                        ).map((hour, index) => (
                          <SelectItem key={index} value={hour}>
                            {hour}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campo Cancha */}
            <FormField
              control={form.control}
              name="court"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-Neutral-dark">
                    <Icon
                      iconNode={soccerPitch}
                      className="text-Primary"
                      size={20}
                    />
                    Cancha
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      type="number"
                      min="1"
                      max="4"
                      className="border-Neutral text-lg"
                    />
                  </FormControl>
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
