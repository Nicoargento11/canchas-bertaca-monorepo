"use client";
import React, { useState, useTransition, useMemo } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PhoneInput from "react-phone-number-input";
import { createReserve } from "@/services/reserve/reserve";
// import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { CalendarDays, Clock9, Coins, Mail, Phone, Receipt, UserCircle2, Gift } from "lucide-react";
import { Icon } from "lucide-react";
import { soccerPitch } from "@lucide/lab";
import { Button } from "@/components/ui/button";
import { useDashboardReserveModalStore } from "@/store/reserveDashboardModalStore";
import "react-phone-number-input/style.css";
import { useDashboardDataStore } from "@/store/dashboardDataStore";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { createReserveAdminSchema } from "@/schemas/reserve";
import { createPayment, PaymentMethod } from "@/services/payment/payment";
import { useReservationDashboard } from "@/contexts/ReserveDashboardContext";
import { toast } from "sonner";
import { getActiveCashSession } from "@/services/cash-session/cash-session";
import { getAllCashRegisters } from "@/services/cash-register/cash-register";
import { Switch } from "@/components/ui/switch";
import { useApplicablePromotions } from "@/hooks/useApplicablePromotions";
import { formatPromotionValue } from "@/services/promotion/promotion";

const PAYMENT_METHODS = [
  { value: "EFECTIVO", label: "Efectivo", icon: "💵" },
  { value: "TARJETA_CREDITO", label: "Tarjeta", icon: "💳" },
  { value: "TRANSFERENCIA", label: "Transferencia", icon: "↗️" },
  { value: "MERCADOPAGO", label: "MercadoPago", icon: "🔵" },
] as const;

export const ReserveForm = () => {
  const [isPending, startTransition] = useTransition();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("EFECTIVO");
  const [applyPromotion, setApplyPromotion] = useState(true); // Toggle para promo

  const { handleChangeReserve } = useDashboardReserveModalStore((state) => state);
  const { fetchReservationsByDay, state } = useReservationDashboard();
  const { createReserve: reserveData, date } = useDashboardDataStore();

  // Calcular promoción aplicable
  const { bestPromotion, calculateFinalPrice } = useApplicablePromotions({
    promotions: state.currentComplex?.promotions,
    date: reserveData?.date,
    schedule: reserveData?.schedule,
    courtId: reserveData?.courtId,
    sportTypeId: state.sportType?.id,
  });

  // Precio final con o sin promo
  const priceInfo = useMemo(() => {
    if (!reserveData?.price) return { originalPrice: 0, finalPrice: 0, discount: 0 };
    if (bestPromotion && applyPromotion) {
      return calculateFinalPrice(reserveData.price);
    }
    return { originalPrice: reserveData.price, finalPrice: reserveData.price, discount: 0 };
  }, [reserveData?.price, bestPromotion, applyPromotion, calculateFinalPrice]);

  const form = useForm<z.infer<typeof createReserveAdminSchema>>({
    resolver: zodResolver(createReserveAdminSchema),
    defaultValues: reserveData
      ? {
        date: reserveData.date,
        schedule: reserveData.schedule,
        userId: reserveData.userId,
        price: reserveData.price,
        status: "APROBADO",
        phone: "",
        clientName: "",
        reservationAmount: 0,
        courtId: reserveData.courtId,
        complexId: reserveData.complexId,
        reserveType: reserveData.reserveType,
      }
      : undefined,
  });

  const selectedDate = date && format(date, "yyyy-MM-dd");
  const handlePayment = async (reserveId: string) => {
    try {
      // Obtener cash session activo si hay un complejo seleccionado
      let cashSessionId: string | undefined;

      if (state.currentComplex?.id) {
        // Primero obtener los cash registers del complejo
        const { success: registersSuccess, data: cashRegisters } = await getAllCashRegisters(
          state.currentComplex.id
        );

        if (registersSuccess && cashRegisters && cashRegisters.length > 0) {
          // Tomar el primer cash register activo
          const activeCashRegister = cashRegisters.find((register) => register.isActive);

          if (activeCashRegister) {
            // Buscar cash session activo para este cash register
            const { success, data: activeCashSession } = await getActiveCashSession(
              activeCashRegister.id
            );

            if (success && activeCashSession) {
              cashSessionId = activeCashSession.id;
            } else {
              // Advertir que no hay cash session activo pero permitir continuar
              toast.warning(
                "No hay una sesión de caja activa. El pago se registrará sin asociar a una sesión."
              );
            }
          } else {
            toast.warning("No hay cajas registradoras activas en este complejo.");
          }
        } else {
          toast.warning("No se encontraron cajas registradoras para este complejo.");
        }
      }

      await createPayment({
        amount: form.getValues("reservationAmount"),
        method: paymentMethod,
        isPartial: true,
        reserveId,
        transactionType: "RESERVA",
        complexId: state.currentComplex?.id,
        cashSessionId, // Solo se incluye si hay cash session activo
      });
      return true;
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Error al procesar el pago");
      return false;
    }
  };

  const onSubmit = async (values: z.infer<typeof createReserveAdminSchema>) => {
    startTransition(async () => {
      try {
        const {
          error,
          success,
          data: reserveResult,
        } = await createReserve({
          ...values,
          reservationAmount: Number(values.reservationAmount),
          price: priceInfo.finalPrice, // Precio con descuento aplicado
          ...(bestPromotion && applyPromotion && { promotionId: bestPromotion.id }),
        });
        if (error || !success) {
          toast.error(error || "Error al crear la reserva");
          return;
        }
        const paymentSuccess = await handlePayment(reserveResult!.id);

        if (paymentSuccess) {
          toast.success("Reserva y pago registrados correctamente");
          if (state.sportType && state.currentComplex) {
            fetchReservationsByDay(selectedDate!, state.currentComplex?.id, state.sportType.id);
          }
          handleChangeReserve();
        }
      } catch (err) {
        console.error("Submission error:", err);
        toast.error("Ocurrió un error inesperado");
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Sección de Información de Reserva (solo lectura) */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Información de la Reserva
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-white/80">
                  <CalendarDays className="text-Primary" size={18} />
                  Fecha
                </Label>
                <Input
                  value={reserveData?.date ? format(reserveData.date, "yyyy-MM-dd") : ""}
                  disabled
                  className="bg-white/10 border-white/10 text-white disabled:opacity-100"
                />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-white/80">
                  <Clock9 className="text-Primary" size={18} />
                  Horario
                </Label>
                <Input
                  value={reserveData?.schedule || ""}
                  disabled
                  className="bg-white/10 border-white/10 text-white disabled:opacity-100"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-white/80">
                  <Receipt className="text-Primary" size={18} />
                  Precio
                </Label>
                {bestPromotion && applyPromotion ? (
                  <div className="flex items-center gap-2">
                    <span className="text-white/50 line-through text-sm">
                      ${priceInfo.originalPrice}
                    </span>
                    <span className="text-green-400 font-bold text-lg">
                      ${priceInfo.finalPrice}
                    </span>
                    <span className="text-amber-400 text-xs">
                      (-${priceInfo.discount})
                    </span>
                  </div>
                ) : (
                  <Input
                    value={reserveData?.price || ""}
                    disabled
                    className="bg-white/10 border-white/10 text-white disabled:opacity-100"
                  />
                )}
              </div>

              {/* Toggle de Promoción */}
              {bestPromotion && (
                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="text-amber-400" size={18} />
                      <div>
                        <p className="text-white font-medium text-sm">{bestPromotion.name}</p>
                        <p className="text-amber-400 text-xs">{formatPromotionValue(bestPromotion)}</p>
                      </div>
                    </div>
                    <Switch
                      checked={applyPromotion}
                      onCheckedChange={setApplyPromotion}
                      className="data-[state=checked]:bg-amber-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sección de Cliente (editable) */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">
              Información del Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <UserCircle2 className="text-Primary" size={18} />
                    Nombre Completo
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isPending}
                      placeholder="Nombre del cliente"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-Primary"
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
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <Phone className="text-Primary" size={18} />
                    Teléfono
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      {...field}
                      international
                      defaultCountry="AR"
                      disabled={isPending}
                      placeholder="Ingrese el teléfono"
                      className="flex h-10 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/30 focus-within:ring-2 focus-within:ring-Primary focus-within:ring-offset-2 focus-within:ring-offset-gray-900 disabled:cursor-not-allowed disabled:opacity-50 [&_.PhoneInputCountrySelect]:bg-gray-900 [&_.PhoneInputCountrySelect]:text-white [&_.PhoneInputInput]:bg-transparent [&_.PhoneInputInput]:text-white [&_.PhoneInputInput]:placeholder:text-white/30 [&_.PhoneInputInput]:outline-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Sección de Pago (editable) */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Información de Pago</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-white/80">
                <Coins className="text-Primary" size={18} />
                Método de Pago
              </Label>
              <Select
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
                disabled={isPending}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue placeholder="Seleccione método" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-white/10 text-white">
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem
                      key={method.value}
                      value={method.value}
                      className="focus:bg-white/10 focus:text-white"
                    >
                      <span className="mr-2">{method.icon}</span>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>{" "}
            <FormField
              control={form.control}
              name="reservationAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-white/80">
                    <Coins className="text-Primary" size={18} />
                    Monto de Reserva/Seña
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
                        $
                      </span>
                      <Input
                        {...field}
                        type="number"
                        disabled={isPending}
                        value={field.value || ""}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(value === "" ? 0 : parseFloat(value) || 0);
                        }}
                        className="pl-8 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-Primary"
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
          disabled={isPending}
          className="w-full py-6 bg-Primary hover:bg-Primary/80 text-white font-bold text-lg"
        >
          {isPending ? (
            <span className="flex items-center gap-2">
              <Spinner />
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

const Spinner = () => (
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
);
