"use client";
import React, { useState, useTransition } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PhoneInput from "react-phone-number-input";
import { createReserve } from "@/services/reserves/reserves";
import { createReserveAdminSchema } from "@/schemas";
import { useToast } from "@/hooks/use-toast";
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
import { Icon } from "lucide-react";
import { soccerPitch } from "@lucide/lab";
import { Button } from "@/components/ui/button";
import { useDashboardReserveModalStore } from "@/store/reserveDashboardModalStore";
import "react-phone-number-input/style.css";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import { format } from "date-fns";
import { createPayment, PaymentMethod } from "@/services/payments/payments";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useReserve } from "@/contexts/reserveContext";

export const METODOS_PAGO = {
  EFECTIVO: { icono: "💵", nombre: "Efectivo" },
  TARJETA_CREDITO: { icono: "💳", nombre: "Tarjeta" },
  TRANSFERENCIA: { icono: "↗️", nombre: "Transferencia" },
  MERCADOPAGO: { icono: "🔵", nombre: "MercadoPago" },
  OTRO: { icono: "❔", nombre: "Otro" },
} as const;

export const ReserveForm = () => {
  const [isPending, startTransition] = useTransition();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.EFECTIVO
  );
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  const { handleChangeReserve } = useDashboardReserveModalStore(
    (state) => state
  );

  const { getReservesByDay } = useReserve();

  const { createReserve: createReserveData, date } = useDashboardDataStore(
    (state) => state
  );
  const selectedDate = date && format(date, "yyyy-MM-dd");

  const { toast } = useToast();

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

  const handleCreatePayment = async (reserveId: string) => {
    setPaymentProcessing(true);
    try {
      const paymentData = {
        amount: form.getValues("reservationAmount"),
        method: paymentMethod,
        isPartial: false,
        reserveId: reserveId,
      };

      await createPayment(paymentData);

      toast({
        variant: "default",
        title: "Pago registrado",
        description: "El pago se ha registrado correctamente",
      });
      return true;
    } catch (error) {
      console.error("Payment error:", error);
      return false;
    } finally {
      setPaymentProcessing(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof createReserveAdminSchema>) => {
    if (!values.clientName) return;

    startTransition(async () => {
      const reserveResult = await createReserve({
        ...values,
        reservationAmount: parseInt(values.reservationAmount.toString()),
      });

      if (reserveResult.error) {
        toast({
          duration: 3000,
          variant: "destructive",
          title: "¡Error!",
          description: reserveResult.error,
        });
        return;
      }

      if (reserveResult.succes) {
        await handleCreatePayment(reserveResult.reserve.id);
      }
      getReservesByDay(selectedDate);
      handleChangeReserve();
      // router.refresh();
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Información de la Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primera columna */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="court"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <Icon
                        iconNode={soccerPitch}
                        className="text-Primary"
                        size={18}
                      />
                      Cancha
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-gray-100" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <CalendarDays className="text-Primary" size={18} />
                      Fecha
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={format(field.value, "yyyy-MM-dd")}
                        disabled
                        className="bg-gray-100"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="schedule"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <Clock9 className="text-Primary" size={18} />
                      Horario
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-gray-100" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            {/* Segunda columna */}
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <Mail className="text-Primary" size={18} />
                      Email
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-gray-100" />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-gray-700">
                      <Receipt className="text-Primary" size={18} />
                      Precio
                    </FormLabel>
                    <FormControl>
                      <Input {...field} disabled className="bg-gray-100" />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-700">
                    <UserCircle2 className="text-Primary" size={18} />
                    Nombre Completo
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Ingrese el nombre del cliente"
                      className="border-gray-300 focus:border-green-500"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-700">
                    <Phone className="text-Primary" size={18} />
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      international
                      defaultCountry="AR"
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="Ingrese el teléfono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Información de Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-gray-700">
                <Coins className="text-Primary" size={18} />
                Método de Pago
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) =>
                  setPaymentMethod(value as PaymentMethod)
                }
                disabled={isPending}
              >
                <SelectTrigger className="border-gray-300 focus:border-green-500">
                  <SelectValue placeholder="Seleccione método" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(METODOS_PAGO).map(
                    ([key, { icono, nombre }]) => (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center">
                          <span className="mr-2">{icono}</span>
                          {nombre}
                        </div>
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>

            <FormField
              control={form.control}
              name="reservationAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-gray-700">
                    <Coins className="text-Primary" size={18} />
                    Monto de Reserva/Seña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        $
                      </span>
                      <Input
                        {...field}
                        disabled={isPending}
                        type="number"
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        className="pl-8 border-gray-300 focus:border-green-500"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={isPending || paymentProcessing}
          className="w-full bg-Primary hover:bg-Primary-dark text-white py-6 text-base font-medium"
        >
          {isPending || paymentProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="animate-spin h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Procesando...
            </span>
          ) : (
            "Confirmar Reserva y Pago"
          )}
        </Button>
      </form>
    </Form>
  );
};
