"use client";
import { Separator } from "@/components/ui/separator";
import { getReserveById, Reserve } from "@/services/reserve/reserve";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { SkeletonPayment } from "../skeletonPayment";
import formatDateUTC from "@/utils/formatDateUtc";
import { CheckCircle2, Building2, Calendar, Clock, DollarSign, Wallet, Icon } from "lucide-react";
import { soccerPitch } from "@lucide/lab";
export default function PaymentSuccess() {
  const searchParams = useSearchParams();
  const [reserve, setReserve] = useState<Reserve | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      const reserveId = searchParams.get("external_reference");
      if (!reserveId) {
        setError("No se encontró el ID de la reserva");
        return;
      }

      try {
        const { success, data, error } = await getReserveById(reserveId);

        if (!success || !data) {
          setError(error || "No se pudo obtener la información de la reserva");
          return;
        }

        setReserve(data);
      } catch (err) {
        setError("Error al cargar los datos de la reserva");
        console.error("Error fetching reserve data:", err);
      }
    });
  }, [searchParams]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-md w-full flex flex-col gap-4 bg-white rounded-xl shadow-2xl p-6 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
        {/* Encabezado con icono */}
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="relative">
            <div className="absolute -inset-2 bg-green-100 dark:bg-green-900 rounded-full blur opacity-75 animate-pulse"></div>
            <CheckCircle2 className="relative text-green-500 w-16 h-16" strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2 bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
            Reserva Confirmada
          </h1>
          <p className="text-center text-gray-600 dark:text-gray-300">
            ¡El pago se ha completado correctamente! Te hemos enviado un correo con los detalles.
          </p>
        </div>

        <Separator className="my-2" />

        {/* Contenido principal */}
        {isPending ? (
          <SkeletonPayment />
        ) : error ? (
          <div className="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {error}
          </div>
        ) : reserve ? (
          <div className="space-y-4">
            {/* Información del complejo */}
            <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg border border-gray-200 dark:border-gray-600">
              <h2 className="font-semibold text-lg text-gray-800 dark:text-white mb-2 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-green-500" strokeWidth={1.5} />
                {reserve.complex?.name || "Complejo Deportivo"}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                {reserve.complex?.address || "Dirección no disponible"}
              </p>
            </div>

            {/* Detalles de la reserva */}
            <div className="grid grid-cols-2 gap-3">
              <DetailCard
                icon={<Calendar className="w-5 h-5 text-green-500" strokeWidth={1.5} />}
                title="Fecha"
                value={formatDateUTC(new Date(reserve.date).toUTCString())}
              />
              <DetailCard
                icon={<Clock className="w-5 h-5 text-green-500" strokeWidth={1.5} />}
                title="Hora"
                value={reserve.schedule}
              />
              <DetailCard
                icon={
                  <Icon
                    iconNode={soccerPitch}
                    className="w-5 h-5 text-green-500"
                    strokeWidth={1.5}
                  />
                }
                title="Cancha"
                value={`${reserve.court?.courtNumber || reserve.court?.name || "N/A"}`}
              />
              <DetailCard
                icon={<DollarSign className="w-5 h-5 text-green-500" strokeWidth={1.5} />}
                title="Monto Pagado"
                value={`$${reserve.reservationAmount?.toLocaleString("es-AR", { currency: "ARS" })}`}
              />
              <DetailCard
                icon={<Wallet className="w-5 h-5 text-green-500" strokeWidth={1.5} />}
                title="Monto Faltante"
                value={`$${(reserve.price! - reserve.reservationAmount!).toLocaleString("es-AR", { currency: "ARS" })}`}
              />
            </div>
          </div>
        ) : null}

        {/* Acciones */}
        <div className="w-full flex flex-col mt-6 gap-3">
          <Link
            href={`/${reserve?.complex?.slug}/profile`}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-medium rounded-lg hover:shadow-lg transition-all hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            prefetch={false}
          >
            Ver mis reservas
          </Link>
          <Link
            href={`/${reserve?.complex?.slug}/`}
            className="inline-flex items-center justify-center px-6 py-3 bg-white text-gray-800 font-medium rounded-lg border border-gray-300 hover:shadow-lg transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            prefetch={false}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

// Componente para mostrar detalles
function DetailCard({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg border border-gray-200 dark:border-gray-600">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mb-1">
        {icon}
        {title}
      </div>
      <div className="font-medium text-gray-900 dark:text-white">{value}</div>
    </div>
  );
}
