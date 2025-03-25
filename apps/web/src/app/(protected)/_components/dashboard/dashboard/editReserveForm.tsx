"use client";
import { Clock9, CalendarDays, CircleUserRound } from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";

import { Button } from "../../../../../components/ui/button";

import { Input } from "../../../../../components/ui/input";
import "react-phone-number-input/style.css";
import { useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
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
import { useRouter } from "next/navigation";
import dayHours from "@/utils/dayHours";
import { useDashboardDetailsModalStore } from "@/store/reserveDashboardDetailsModalStore";
import { useDashboardEditReserveModalStore } from "@/store/editReserveDashboardModalStore";
import { editReserve } from "@/services/reserves/reserves";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useDashboardDataStore } from "@/store/dashboardDataStore";

export const EditReserveForm = () => {
  const [isPending, startTransition] = useTransition();

  const { handleChangeDetails } = useDashboardDetailsModalStore(
    (state) => state
  );

  const { reserve, date } = useDashboardDataStore((state) => state);

  const { handleChangeEditReserve } = useDashboardEditReserveModalStore(
    (state) => state
  );

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof editReserveAdminSchema>>({
    defaultValues: reserve! && {
      court: reserve.court,
      date: date,
      schedule: reserve.schedule,
      clientName: reserve.clientName || reserve.User.name,
    },
  });
  const onSubmit = (values: z.infer<typeof editReserveAdminSchema>) => {
    if (reserve) {
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
              description: data?.succes,
            });
          }
          if (data?.error) {
            toast({
              duration: 3000,
              variant: "destructive",
              title: "¡Ha ocurrido un error!",
              description: data?.error,
            });
          }
          handleChangeEditReserve();
          handleChangeDetails();
        });
        router.refresh();
      });
    }
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="">
          <FormField
            control={form.control}
            name="court"
            render={({ field }) => (
              <FormItem className="flex items-center justify-center gap-2 ">
                <GiSoccerField color="green" className="mt-2" size={20} />

                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    type="number"
                    min="1"
                    max="4"
                    className="border-gray-300 text-lg"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex items-center justify-center gap-2">
                <CalendarDays color="green" className="mt-2" size={20} />

                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full border-gray-300 justify-start pl-3 font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "yyyy-MM-dd")
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
                      onSelect={(date) => field.onChange(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem className="flex items-center justify-center gap-2">
                <Clock9 color="green" className="mt-2" size={20} />
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="border-gray-300 text-lg">
                      <SelectValue placeholder="Select a verified email to display" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {reserve &&
                      dayHours(new Date(reserve.date)).map((hour, index) => (
                        <SelectItem key={index} value={hour}>
                          {hour}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem className="flex items-center justify-center gap-2">
                <CircleUserRound color="green" className="mt-2" size={20} />

                <FormControl>
                  <Input
                    {...field}
                    disabled={isPending}
                    placeholder=""
                    type=""
                    className="border-gray-300 text-lg"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {/* <FormError message={error} />
    <FormSucces message={succes} /> */}
        <Button
          type="submit"
          disabled={isPending}
          className=" bg-Primary text-base w-full"
        >
          Confirmar
        </Button>
      </form>
    </Form>
  );
};
