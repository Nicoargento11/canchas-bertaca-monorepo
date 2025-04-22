"use client";
import React, { useEffect, useState, useTransition } from "react";
import { format } from "date-fns";
import { useModal } from "@/contexts/modalContext";
import { Button } from "../ui/button";
import {
  Clock9,
  CalendarDays,
  Coins,
  // Gift,
  Receipt,
  Phone,
  AlertCircle,
} from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { es } from "date-fns/locale";
import { SkeletonModal } from "../skeletonModal";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { FormError } from "../form-error";
import { FormSucces } from "../form-succes";
// import beerService from "@/utils/beerService";
import { useReserve } from "@/contexts/reserveContext";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { reserveTurnSchema } from "@/schemas";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Session } from "@/services/auth/session";
import { createPaymentOnline } from "@/services/payments/payments";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { getUserById, User } from "@/services/users/users";
import { Schedule } from "@/services/schedule/schedule";
import priceCalculator from "@/utils/priceCalculator";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string, {
  locale: "es-AR",
});

interface ReserveTurnProps {
  currentUser?: Session | null;
  schedules: Schedule[];
}

const ReserveTurn: React.FC<ReserveTurnProps> = ({
  currentUser,
  schedules,
}) => {
  const { reserveForm } = useReserve();
  const { oncloseReserve, handleChangeLogin, handleChangeRegister } =
    useModal();
  const [error, setError] = useState<string | undefined>("");
  const [succes, setSucces] = useState<string | undefined>("");
  const [isLoading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [preferenceId, setPreferenceId] = useState<string | null>();
  const [user, setUser] = useState<User | null>(null);

  const form = useForm<z.infer<typeof reserveTurnSchema>>({
    resolver: zodResolver(reserveTurnSchema),
    defaultValues: {
      court: reserveForm.field,
      date: reserveForm.day,
      schedule: reserveForm.hour,
      userId: currentUser?.user.id,
      phone: currentUser?.user.phone || localStorage.getItem("phone") || "",
      reservationAmount: 0,
      price: 0,
    },
  });

  console.log(form.watch());

  useEffect(() => {
    setLoading(true);
    if (reserveForm.hour && reserveForm.field && reserveForm.day) {
      startTransition(async () => {
        try {
          if (currentUser) {
            const userData = await getUserById(currentUser.user.id);
            setUser(userData);

            // Calcular precios dinámicamente
            const pricing = priceCalculator(
              reserveForm.day,
              reserveForm.hour,
              schedules
            );

            if (!pricing) {
              throw new Error(
                "No se pudo calcular el precio para este horario"
              );
            }

            form.reset({
              court: reserveForm.field,
              date: reserveForm.day,
              schedule: reserveForm.hour,
              userId: currentUser?.user.id || "",
              reservationAmount: pricing.reservationAmount,
              price: pricing.price,
              phone: userData.phone || localStorage.getItem("phone") || "",
            });
          }
        } catch (error) {
          console.error("Error al calcular precios:", error);
          setError("No se pudo determinar el precio para este horario");
          form.reset({
            court: reserveForm.field,
            date: reserveForm.day,
            schedule: reserveForm.hour,
            userId: currentUser?.user.id || "",
            reservationAmount: 0,
            price: 0,
            phone:
              currentUser?.user.phone || localStorage.getItem("phone") || "",
          });
        } finally {
          setLoading(false);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reserveForm, currentUser, schedules]);

  if (!currentUser) {
    return (
      <div className="text-center p-6 bg-Primary-light/10 rounded-lg border border-Primary-light">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-10 w-10 text-Primary" />
          <h3 className="text-xl font-semibold text-Primary-dark">
            Registro Requerido
          </h3>
          <p className="text-gray-700">
            Para completar tu reserva necesitas una cuenta. Es rápido y
            sencillo.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => {
                // Guarda los datos temporales antes de cerrar
                localStorage.setItem(
                  "reserveData",
                  JSON.stringify({
                    field: reserveForm.field,
                    day: reserveForm.day.toISOString(),
                    hour: reserveForm.hour,
                    // phone: form.getValues("phone") || ""
                  })
                );
                handleChangeLogin();
                oncloseReserve();
              }}
              variant="outline"
              className="border-Primary text-Primary hover:bg-Primary/10"
            >
              Iniciar Sesión
            </Button>
            <Button
              onClick={() => {
                // Guarda los datos temporales antes de cerrar
                localStorage.setItem(
                  "reserveData",
                  JSON.stringify({
                    field: reserveForm.field,
                    day: reserveForm.day.toISOString(),
                    hour: reserveForm.hour,
                    // phone: form.getValues("phone") || "",
                  })
                );
                handleChangeRegister();
                oncloseReserve();
              }}
              className="bg-Primary hover:bg-Primary-dark"
            >
              Crear Cuenta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleReserve = (values: z.infer<typeof reserveTurnSchema>) => {
    if (currentUser) {
      createPaymentOnline(values).then((data) => {
        setError(data?.error);
        setSucces(data?.succes);
        setPreferenceId(data?.id);
      });

      return;
    }
    // localStorage.setItem("court", reserveForm.field.toString());
    // localStorage.setItem("date", format(reserveForm.day, "dd/MM/yyyy"));
    // localStorage.setItem("schedule", reserveForm.hour);
    // localStorage.setItem("phone", values.phone);
    // oncloseReserve();
    // onOpenRegister();
  };

  return (
    <section className="font-medium text-black bg-Neutral-light rounded-lg p-6 shadow-lg">
      {isLoading ? (
        <SkeletonModal />
      ) : (
        <>
          <h1 className="text-center text-3xl font-bold text-Primary mb-6">
            Información de la reserva
          </h1>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(handleReserve)}
              className="space-y-6"
            >
              {/* Detalles de la reserva */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                      <CalendarDays className="text-Complementary" size={30} />
                      <span className="text-lg font-semibold text-black">
                        {format(field.value, "EEEE d 'de' MMMM", {
                          locale: es,
                        })}
                      </span>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                      <Clock9 className="text-Complementary" size={30} />
                      <span className="text-lg font-semibold text-black">
                        {field.value}
                      </span>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="court"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                      <GiSoccerField className="text-Complementary" size={30} />
                      <span className="text-lg font-semibold text-black">
                        Cancha {field.value}
                      </span>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reservationAmount"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                      <Coins className="text-Complementary" size={30} />
                      <span className="text-lg font-semibold text-black">
                        Reserva/seña $
                        {field.value.toLocaleString("es-AR", {
                          currency: "ARS",
                        })}
                      </span>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                      <Receipt className="text-Complementary" size={30} />
                      <span className="text-lg font-semibold text-black">
                        Precio &nbsp;
                        <span className="">
                          $
                          {field.value.toLocaleString("es-AR", {
                            currency: "ARS",
                          })}
                        </span>
                      </span>
                    </FormItem>
                  )}
                />
                {/* {beerService(reserveForm.hour) && (
                  <div className="flex items-center gap-4">
                    <Gift className="text-Complementary" size={25} />
                    <span className="text-lg font-semibold text-black">
                      1 gaseosa 1.5l o 1 quilmes bajo cero
                    </span>
                  </div>
                )} */}
              </div>

              {/* Campo de teléfono */}
              {!user?.phone && (
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem className="space-y-2">
                      <div className="flex items-center gap-4">
                        <Phone className="text-Complementary" size={25} />
                        <FormControl>
                          <InputOTP
                            {...field}
                            disabled={isPending}
                            maxLength={10}
                            className="m-0"
                          >
                            <p className="text-nowrap text-sm font-semibold text-black">
                              +54 9
                            </p>
                            <InputOTPGroup>
                              <InputOTPSlot index={0} />
                              <InputOTPSlot index={1} />
                              <InputOTPSlot index={2} />
                              <InputOTPSlot index={3} />
                            </InputOTPGroup>
                            <InputOTPGroup>
                              <InputOTPSlot index={4} />
                              <InputOTPSlot index={5} />
                              <InputOTPSlot index={6} />
                              <InputOTPSlot index={7} />
                              <InputOTPSlot index={8} />
                              <InputOTPSlot index={9} />
                            </InputOTPGroup>
                          </InputOTP>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Mensajes de error y éxito */}
              <div className="flex flex-col gap-2">
                <FormError message={error} link="profile" />
                <FormSucces message={succes} />
              </div>

              {/* Botón de reserva */}
              {!preferenceId && (
                <Button
                  type="submit"
                  disabled={isPending}
                  className="bg-Primary hover:bg-Primary-dark text-white w-full py-3 text-lg font-bold"
                >
                  Reservar horario
                </Button>
              )}
            </form>

            {/* Integración de MercadoPago */}
            {preferenceId && (
              <Wallet initialization={{ preferenceId: preferenceId }} />
            )}
          </Form>
        </>
      )}
    </section>
  );
};

export default ReserveTurn;
