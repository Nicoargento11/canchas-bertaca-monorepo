"use client";
import React, { useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import PhoneInput from "react-phone-number-input";
import { createReserve } from "@/services/reserves/reserves";
import { createReserveAdminSchema } from "@/schemas";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import {
  CalendarDays,
  Clock9,
  Coins,
  Mail,
  Phone,
  Receipt,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { useDashboardReserveModalStore } from "@/store/reserveDashboardModalStore";

import "react-phone-number-input/style.css";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import { format } from "date-fns";

export const ReserveForm = () => {
  const [isPending, startTransition] = useTransition();

  const { handleChangeReserve } = useDashboardReserveModalStore(
    (state) => state
  );

  const { createReserve: createReserveData } = useDashboardDataStore(
    (state) => state
  );

  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof createReserveAdminSchema>>({
    resolver: zodResolver(createReserveAdminSchema),
    defaultValues: createReserveData && {
      court: createReserveData.court,
      date: createReserveData.date,
      schedule: createReserveData.hour,
      userId: createReserveData.userId,
      userEmail: createReserveData.userEmail,
      price: createReserveData.price,
      status: "APROBADO",
      phone: "",
      clientName: "",
      reservationAmount: 0,
    },
  });
  const onSubmit = (values: z.infer<typeof createReserveAdminSchema>) => {
    if (values.clientName) {
      startTransition(() => {
        createReserve({
          ...values,
          reservationAmount: parseInt(values.reservationAmount.toString()),
        }).then((data) => {
          if (data.succes) {
            toast({
              duration: 3000,
              variant: "default",
              title: "¡Excelente!",
              description: data?.succes,
            });
          }
          if (data.error) {
            toast({
              duration: 3000,
              variant: "destructive",
              title: "¡Error!",
              description: data?.error,
            });
          }
          handleChangeReserve();
        });
      });
    }
    router.refresh();
  };
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="">
          <FormField
            control={form.control}
            name="court"
            render={({ field }) => (
              <FormItem className="flex items-center justify-center">
                <GiSoccerField color="green" className="mt-2" size={20} />

                <FormControl>
                  <Input {...field} disabled={true} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex items-center justify-center">
                <CalendarDays color="green" className="mt-2" size={20} />

                <FormControl>
                  <Input
                    {...field}
                    value={format(field.value, "yyyy-MM-dd")}
                    disabled={true}
                  ></Input>
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="schedule"
            render={({ field }) => (
              <FormItem className="flex items-center justify-center">
                <Clock9 color="green" className="mt-2" size={20} />

                <FormControl>
                  <Input {...field} disabled={true} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userEmail"
            render={({ field }) => (
              <FormItem className="flex items-center justify-center">
                <Mail color="green" className="mt-2" size={20} />

                <FormControl>
                  <Input {...field} disabled={true} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem className="flex items-center justify-center">
                <Receipt color="green" className="mt-2" size={20} />

                <FormControl>
                  <Input {...field} disabled={true} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-center gap-2">
                  <Phone color="green" className="mt-2" size={20} />

                  <FormControl>
                    <PhoneInput
                      {...field}
                      className="w-full border-2 border-gray-300 rounded-md"
                      defaultCountry="AR"
                      initialValueFormat="national"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientName"
            render={({ field }) => (
              <FormItem className="">
                <div className="flex items-center justify-center gap-2">
                  <UserCircle2 color="green" className="mt-2" size={20} />

                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder=""
                      type=""
                      className="border-gray-400"
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="reservationAmount"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-center gap-2">
                  <Coins color="green" className="mt-2" size={20} />

                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder=""
                      type="number"
                      className="border-gray-400"
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button
          type="submit"
          disabled={isPending}
          className=" bg-Primary text-base w-full"
        >
          {isPending ? "Reservando..." : "Reservar"}
        </Button>
      </form>
    </Form>
  );
};
