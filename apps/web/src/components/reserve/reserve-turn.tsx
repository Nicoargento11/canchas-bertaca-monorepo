"use client";
import React, { useEffect, useMemo, useState } from "react";
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
  ArrowDown,
  Timer,
} from "lucide-react";
import { GiSoccerField } from "@react-icons/all-files/gi/GiSoccerField";
import { es } from "date-fns/locale";
import { SkeletonModal } from "../skeletonModal";
import { initMercadoPago, Wallet } from "@mercadopago/sdk-react";
import { FormError } from "../form-error";
import { FormSucces } from "../form-succes";
// import beerService from "@/utils/beerService";
import { useReserve } from "@/contexts/newReserveContext";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
// import { createPaymentOnline } from "@/services/payments/payments";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/input-otp";
import { Schedule } from "@/services/schedule/schedule";
import priceCalculator from "@/utils/priceCalculator";
import { Complex } from "@/services/complex/complex";
import { SessionPayload } from "@/services/auth/session";
import { getUserById, User } from "@/services/user/user";
import { reserveTurnSchema } from "@/schemas/reserve";
import { SportType } from "@/services/sport-types/sport-types";
import { createPaymentOnline } from "@/services/payment/payment";
import { Input } from "../ui/input";

initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string, {
  locale: "es-AR",
});

interface ReserveTurnProps {
  currentUser?: SessionPayload | null;
  complex: Complex;
  sportType: SportType;
}

const ReserveTurn: React.FC<ReserveTurnProps> = ({ currentUser, complex, sportType }) => {
  const { state, updateReservationForm, getCurrentReservation } = useReserve();
  const reservationData = getCurrentReservation();
  const { closeModal, openModal } = useModal();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isLoading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>();
  const [user, setUser] = useState<User | undefined>(undefined);

  const courtData = complex.courts.find((court) => court.id === reservationData?.form.field);
  const form = useForm<z.infer<typeof reserveTurnSchema>>({
    resolver: zodResolver(reserveTurnSchema),
    defaultValues: reservationData && {
      courtId: reservationData.form.field,
      date: reservationData.form.day,
      schedule: reservationData.form.hour,
      userId: currentUser?.user.id,
      phone: currentUser?.user.phone || localStorage.getItem("phone") || "",
      reservationAmount: 0,
      price: 0,
    },
  });

  useEffect(() => {
    const hour = reservationData?.form.hour;
    const field = reservationData?.form.field;
    const day = reservationData?.form.day;

    if (!hour || !field || !day || !currentUser) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const { data: userData } = await getUserById(currentUser.user.id);
        setUser(userData);

        const pricing = priceCalculator(day, hour, complex.schedules, field);
        if (!pricing) throw new Error("Price calculation failed");

        const newValues = {
          courtId: field,
          date: day,
          schedule: hour,
          userId: currentUser.user.id,
          reservationAmount: pricing.reservationAmount,
          price: pricing.price,
          phone: userData?.phone || localStorage.getItem("phone") || "",
        };

        // Solo resetear si los valores son diferentes

        form.reset(newValues);
      } catch (error) {
        console.error("Error:", error);
        setError("Error loading data");
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(loadData, 100); // Pequeño delay para agrupar updates
    return () => clearTimeout(timer);
  }, [
    reservationData?.form.hour,
    reservationData?.form.field,
    reservationData?.form.day,
    currentUser?.user.id,
  ]);

  if (!currentUser) {
    return (
      <div className="text-center p-6 bg-Primary-light/10 rounded-lg border border-Primary-light">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-10 w-10 text-Primary" />
          <h3 className="text-xl font-semibold text-Primary-dark">Registro Requerido</h3>
          <p className="text-gray-700">
            Para completar tu reserva necesitas una cuenta. Es rápido y sencillo.
          </p>
          <div className="flex gap-3 mt-4">
            <Button
              onClick={() => {
                // Guarda los datos temporales antes de cerrar
                reservationData &&
                  localStorage.setItem(
                    "reserveData",
                    JSON.stringify({
                      field: reservationData.form.field,
                      day: reservationData.form.day.toISOString(),
                      hour: reservationData.form.hour,
                      // phone: form.getValues("phone") || ""
                    })
                  );
                closeModal();
                openModal("LOGIN", { complexId: complex.id });
                // handleChangeLogin();
                // onCloseFutbolReserve();
              }}
              variant="outline"
              className="border-Primary text-Primary hover:bg-Primary/10"
            >
              Iniciar Sesión
            </Button>
            <Button
              onClick={() => {
                // Guarda los datos temporales antes de cerrar
                reservationData &&
                  localStorage.setItem(
                    "reserveData",
                    JSON.stringify({
                      field: reservationData.form.field,
                      day: reservationData.form.day.toISOString(),
                      hour: reservationData.form.hour,
                      // phone: form.getValues("phone") || "",
                    })
                  );
                closeModal();
                openModal("REGISTER", { complexId: complex.id });
                // onCloseFutbolReserve();
                // handleChangeRegister();
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
  const handleReserve = async (values: z.infer<typeof reserveTurnSchema>) => {
    if (!currentUser) return;

    // Prevenir dobles clics
    if (isProcessingPayment) return;

    setIsProcessingPayment(true);
    setError("");
    setSuccess("");

    try {
      // Actualiza el formulario de reserva con los datos del teléfono si es necesario
      if (values.phone) {
        updateReservationForm("metadata", {
          ...reservationData?.form.metadata,
          phone: values.phone,
        });
      }

      const data = await createPaymentOnline(values, complex.id);

      setError(data?.error);

      if (data?.success) {
        setSuccess(""); // Limpiar el mensaje de success del FormSucces
        setPreferenceId(data?.data?.id);
      }
    } catch (error) {
      setError("Error al procesar el pago. Intenta nuevamente.");
    } finally {
      setIsProcessingPayment(false);
    }
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
            <form onSubmit={form.handleSubmit(handleReserve)} className="space-y-6">
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
                      <span className="text-lg font-semibold text-black">{field.value}</span>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courtId"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                      <GiSoccerField className="text-Complementary" size={30} />
                      <span className="text-lg font-semibold text-black">
                        Cancha {courtData?.courtNumber || courtData?.name}
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
                {/* {beerService(reservationData.form.hour) && (
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
                    <FormItem className="space-y-2 w-full">
                      <div className="flex items-center gap-2 sm:gap-4 w-full">
                        <Phone className="text-Complementary flex-shrink-0" size={20} />

                        {/* Versión desktop (OTP) - visible solo en sm+ */}
                        <FormControl className="hidden sm:block w-full">
                          <div className="w-full">
                            <InputOTP {...field} disabled={isProcessingPayment} maxLength={10}>
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-black">+54 9</p>
                                <InputOTPGroup className="gap-1">
                                  {[...Array(10)].map((_, index) => (
                                    <InputOTPSlot
                                      key={index}
                                      index={index}
                                      className="w-8 h-8 text-sm"
                                    />
                                  ))}
                                </InputOTPGroup>
                              </div>
                            </InputOTP>
                          </div>
                        </FormControl>

                        {/* Versión móvil (Input normal) - visible solo en móviles */}
                        <FormControl className="sm:hidden w-full">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-gray-700 whitespace-nowrap">
                              +54 9
                            </p>
                            <Input
                              type="tel"
                              {...field}
                              disabled={isProcessingPayment}
                              className="flex-1 py-5 text-base"
                              placeholder="379 4345678"
                              maxLength={10}
                              inputMode="numeric"
                            />
                          </div>
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Mensajes de error y éxito */}
              <div className="flex flex-col gap-2">
                <FormError message={error} link={`/${complex.slug}/profile`} />
                <FormSucces message={success} />
              </div>

              {/* Botón de reserva mejorado */}
              {!preferenceId && (
                <Button
                  type="submit"
                  disabled={isProcessingPayment}
                  className="bg-Primary hover:bg-Primary-dark text-white w-full py-3 text-lg font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {isProcessingPayment ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Procesando pago...
                    </div>
                  ) : (
                    "Reservar horario"
                  )}
                </Button>
              )}

              {/* Estado de loading para MercadoPago */}
              {isProcessingPayment && !preferenceId && (
                <div className="flex flex-col items-center justify-center gap-3 py-6 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-blue-700 font-medium">Preparando tu pago...</p>
                  <p className="text-blue-600 text-sm text-center">
                    En unos segundos aparecerá el botón de MercadoPago
                  </p>
                </div>
              )}
            </form>

            {/* Integración de MercadoPago mejorada */}
            {preferenceId && (
              <div className="space-y-6">
                <div className="text-center py-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex justify-center mb-3">
                    <AlertCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-green-700 font-bold text-lg mb-3">
                    Paga ÚNICAMENTE por este link, de lo contrario NO se reservará tu cancha:
                  </p>
                  <ArrowDown className="w-6 h-6 text-green-600 animate-bounce mx-auto" />
                </div>

                <Wallet
                  initialization={{ preferenceId: preferenceId }}
                  onReady={() => {}}
                  onError={(error) => {
                    console.error("❌ [MP] Error en widget:", error);
                    setError("Error al cargar MercadoPago. Recarga la página.");
                    setIsProcessingPayment(false);
                  }}
                />

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="text-center">
                    <p className="text-red-700 font-bold text-sm">
                      ⚠️ Tienes 10 minutos para pagar, de lo contrario tu reserva se cancela
                      automáticamente.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </Form>
        </>
      )}
    </section>
  );
};

export default ReserveTurn;
