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
  Building2,
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
import { useApplicablePromotions } from "@/hooks/useApplicablePromotions";
import { PromoSummary } from "@/components/promotions/PromoSummary";
import { Promotion } from "@/services/promotion/promotion";
import { getMercadoPagoPublicKey } from "@/services/complex/complex";

// Inicialización por defecto (se re-inicializará con la clave del complejo)
initMercadoPago(process.env.NEXT_PUBLIC_MP_PUBLIC_KEY as string, {
  locale: "es-AR",
});

interface ReserveTurnProps {
  currentUser?: SessionPayload | null;
  complex: Complex;
  sportType: SportType;
  promotions?: Promotion[];
}

const ReserveTurn: React.FC<ReserveTurnProps> = ({
  currentUser,
  complex,
  sportType,
  promotions,
}) => {
  const { state, updateReservationForm, getCurrentReservation } = useReserve();
  const reservationData = getCurrentReservation();
  const { closeModal, openModal } = useModal();
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isLoading, setLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [preferenceId, setPreferenceId] = useState<string | null>();
  const [initPoint, setInitPoint] = useState<string | null>(null);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [mpInitialized, setMpInitialized] = useState(false);

  const courtData = complex.courts.find((court) => court.id === reservationData?.form.field);

  // Calcular promoción aplicable
  const { bestPromotion, calculateFinalPrice } = useApplicablePromotions({
    promotions,
    date: reservationData?.form.day,
    schedule: reservationData?.form.hour,
    courtId: reservationData?.form.field,
    sportTypeId: sportType.id,
  });
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
        // 1. Cargar datos del usuario y precios
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

        form.reset(newValues);

        // 2. Inicializar MercadoPago con la clave del complejo
        try {
          const mpConfigResult = await getMercadoPagoPublicKey(complex.id);

          if (mpConfigResult.success && mpConfigResult.data?.publicKey) {
            // Re-inicializar MercadoPago con la publicKey del complejo
            console.log("🔄 Inicializando MercadoPago con clave del complejo:", complex.name);
            initMercadoPago(mpConfigResult.data.publicKey, {
              locale: "es-AR",
            });
            setMpInitialized(true);
          } else {
            // Si no hay config específica, usar la clave global como fallback
            console.warn(
              "⚠️ No se encontró configuración de MP para el complejo, usando clave global"
            );
            setMpInitialized(true);
          }
        } catch (mpError) {
          console.error("Error al obtener configuración de MercadoPago:", mpError);
          // Continuar con la clave global
          setMpInitialized(true);
        }
      } catch (error: any) {
        console.error("Error loading reservation data:", error);
        if (error.message === "Price calculation failed") {
          // No mostramos error bloqueante, permitimos que el usuario intente (el backend validará)
          // O mostramos un mensaje más suave
          setError(
            "No se pudo calcular la tarifa exacta. Verifique la disponibilidad al confirmar."
          );
          // Seteamos valores por defecto para permitir la UI
          form.reset({
            courtId: field,
            date: day,
            schedule: hour,
            userId: currentUser.user.id,
            reservationAmount: 0,
            price: 0,
            phone: user?.phone || localStorage.getItem("phone") || "",
          });
        } else {
          setError("Error al cargar los datos de la reserva.");
        }
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
      <div className="text-center p-6 bg-white/5 backdrop-blur-sm rounded-xl border border-white/20">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="h-10 w-10 text-white" />
          <h3 className="text-xl font-semibold text-white">Registro Requerido</h3>
          <p className="text-white/70">
            Para completar tu reserva necesitas una cuenta. Es rápido y sencillo.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-4 w-full sm:w-auto">
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
                      complexId: complex.id,
                      sportTypeKey: sportType.name,
                      sportTypeId: sportType.id,
                      // phone: form.getValues("phone") || ""
                    })
                  );
                closeModal();
                openModal("LOGIN", { complexId: complex.id });
                // handleChangeLogin();
                // onCloseFutbolReserve();
              }}
              variant="outline"
              className="border-white/20 text-black hover:bg-white/10 w-full sm:w-auto"
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
                      complexId: complex.id,
                      sportTypeKey: sportType.name,
                      sportTypeId: sportType.id,
                      // phone: form.getValues("phone") || "",
                    })
                  );
                closeModal();
                openModal("REGISTER", { complexId: complex.id });
                // onCloseFutbolReserve();
                // handleChangeRegister();
              }}
              className="bg-white text-black hover:bg-white/90 w-full sm:w-auto"
            >
              Crear Cuenta
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const isSeven = complex.name.toLowerCase().includes("seven");
  const complexColor = isSeven ? "text-green-400" : "text-blue-400";
  const complexBg = isSeven ? "bg-green-500/10" : "bg-blue-500/10";
  const complexBorder = isSeven ? "border-green-500/20" : "border-blue-500/20";

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

      // Calculamos el precio final y la seña proporcional para enviar al servidor
      const priceInfo = calculateFinalPrice(values.price);
      const finalPrice = priceInfo.finalPrice;

      const discountRatio = values.price > 0 ? finalPrice / values.price : 1;
      const adjustedReservationAmount = Math.round(values.reservationAmount * discountRatio);

      // Agregar promotionId si hay promoción aplicable
      const paymentData = {
        ...values,
        price: finalPrice,
        reservationAmount: adjustedReservationAmount,
        ...(bestPromotion && { promotionId: bestPromotion.id }),
      };

      const data = await createPaymentOnline(paymentData, complex.id);

      setError(data?.error);

      if (data?.success) {
        setSuccess(""); // Limpiar el mensaje de success del FormSucces
        setPreferenceId(data?.data?.id);
        setInitPoint(data?.data?.init_point || null);
      }
    } catch (error) {
      setError("Error al procesar el pago. Intenta nuevamente.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <section className="font-medium text-white bg-white/5 backdrop-blur-sm rounded-xl p-4 sm:p-6 shadow-lg border border-white/20">
      {isLoading ? (
        <SkeletonModal />
      ) : (
        <>
          <h1 className="text-center text-3xl font-bold text-white mb-6">
            Información de la reserva
          </h1>

          {/* Complex Indicator */}
          <div
            className={`mb-6 p-4 rounded-xl border ${complexBorder} ${complexBg} flex items-center justify-center gap-3`}
          >
            <div className="w-12 h-12 flex items-center justify-center">
              <img
                src={`/images/${isSeven ? "seven" : "bertaca"}_logo.png`}
                alt={complex.name}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="text-center">
              <p className={`text-sm font-medium ${complexColor} uppercase tracking-wider`}>
                Estás reservando en
              </p>
              <p className={`text-xl font-bold ${complexColor}`}>Sede {complex.name}</p>
            </div>
          </div>

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
                      <span className="text-lg font-semibold text-white">
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
                      <span className="text-lg font-semibold text-white">{field.value}</span>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="courtId"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-4">
                      <GiSoccerField className="text-Complementary" size={30} />
                      <span className="text-lg font-semibold text-white">
                        Cancha {courtData?.courtNumber || courtData?.name}
                      </span>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="reservationAmount"
                  render={({ field }) => {
                    const priceInfo = calculateFinalPrice(form.getValues("price"));
                    const discountRatio =
                      priceInfo.originalPrice > 0
                        ? priceInfo.finalPrice / priceInfo.originalPrice
                        : 1;
                    const adjustedAmount = Math.round(field.value * discountRatio);

                    return (
                      <FormItem className="flex items-center gap-4">
                        <Coins className="text-Complementary" size={30} />
                        <span className="text-lg font-semibold text-white">
                          Reserva/seña ${adjustedAmount.toLocaleString("es-AR")}
                        </span>
                      </FormItem>
                    );
                  }}
                />
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => {
                    const priceInfo = calculateFinalPrice(field.value);
                    const hasDiscount = priceInfo.discount > 0;

                    return (
                      <FormItem className="flex items-center gap-4">
                        <Receipt className="text-Complementary" size={30} />
                        <span className="text-lg font-semibold text-white">
                          Precio &nbsp;
                          {hasDiscount ? (
                            <>
                              <span className="line-through text-white/50">
                                ${field.value.toLocaleString("es-AR")}
                              </span>
                              <span className="ml-2 text-green-400">
                                ${priceInfo.finalPrice.toLocaleString("es-AR")}
                              </span>
                            </>
                          ) : (
                            <span>${field.value.toLocaleString("es-AR")}</span>
                          )}
                        </span>
                      </FormItem>
                    );
                  }}
                />

                {/* Resumen de promoción aplicada */}
                {bestPromotion && (
                  <PromoSummary
                    originalPrice={form.getValues("price")}
                    discount={calculateFinalPrice(form.getValues("price")).discount}
                    finalPrice={calculateFinalPrice(form.getValues("price")).finalPrice}
                    promotion={bestPromotion}
                  />
                )}

                {/* {beerService(reservationData.form.hour) && (
                  <div className="flex items-center gap-4">
                    <Gift className="text-Complementary" size={25} />
                    <span className="text-lg font-semibold text-white">
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
                                <p className="text-sm font-semibold text-white">+54 9</p>
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
                            <p className="text-sm font-medium text-white/70 whitespace-nowrap">
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
                <FormError
                  message={error}
                  link={
                    error && error.toLowerCase().includes("pendientes") ? "/profile" : undefined
                  }
                />
                <FormSucces message={success} />
              </div>

              {/* Botón de reserva mejorado */}
              {!preferenceId && (
                <div className="space-y-3">
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
                  {/* Checkout Pro badge */}
                  <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                    <img src="/images/Insignia.png" alt="Checkout Pro" className="h-5 w-auto" />
                    <span>Pago seguro con Mercado Pago</span>
                  </div>
                </div>
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

              {/* Mostrar estado de carga si hay preferenceId pero MP no está listo */}
              {preferenceId && !mpInitialized && (
                <div className="flex flex-col items-center justify-center gap-3 py-6 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="w-8 h-8 border-3 border-yellow-500 border-t-transparent rounded-full animate-spin" />
                  <p className="text-yellow-700 font-medium">Inicializando MercadoPago...</p>
                  <p className="text-yellow-600 text-sm text-center">
                    Cargando configuración de pago del complejo
                  </p>
                </div>
              )}
            </form>

            {/* Integración de MercadoPago mejorada */}
            {preferenceId && mpInitialized && (
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
                  onReady={() => {
                    console.log("✅ Wallet de MercadoPago cargado correctamente");
                  }}
                  onError={(error) => {
                    console.error("❌ Error en Wallet de MercadoPago:", error);
                    setError("Error al cargar MercadoPago. Usa el botón alternativo.");
                    setIsProcessingPayment(false);
                  }}
                />

                {/* Botón de respaldo por si falla el widget */}
                {/* {initPoint && (
                  <div className="text-center">
                    <p className="text-white/70 text-sm mb-2">¿No carga el botón de pago?</p>
                    <Button
                      type="button"
                      onClick={() => (window.location.href = initPoint)}
                      className="bg-blue-500 hover:bg-blue-600 text-white w-full sm:w-auto"
                    >
                      Pagar en Mercado Pago
                    </Button>
                  </div>
                )} */}

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
