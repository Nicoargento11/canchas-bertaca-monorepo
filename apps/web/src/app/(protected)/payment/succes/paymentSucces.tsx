"use client";
import { Separator } from "@/components/ui/separator";
import { getReserveByIdFetch, Reserve } from "@/services/reserves/reserves";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import { SkeletonPayment } from "../skeletonPayment";
import formatDateUTC from "@/utils/formatDateUtc";

export default function PaymentSucces() {
  const searchParams = useSearchParams();
  const [reserve, setReserve] = useState<Reserve | null>();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(() => {
      const reserveId = searchParams.get("external_reference");
      if (reserveId) {
        getReserveByIdFetch(reserveId).then((reserve) => setReserve(reserve));
      }
    });
  }, [searchParams]);

  return (
    <div>
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
        <div
          className="max-w-md w-full flex flex-col gap-3
        bg-white  rounded-lg shadow-lg p-8"
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <CircleCheckIcon className="text-Primary w-16 h-16" />
            <h1 className="text-2xl font-bold text-gray-900 ">
              Reserva Exitosa
            </h1>
            <p className="text-gray-600 ">
              ¡El pago se ha completado correctamente!
            </p>
            <p className="text-gray-600 ">Se ha enviado un comprobante a:</p>
            {reserve?.User && (
              <p className="text-gray-600 ">{reserve?.User.email}</p>
            )}
          </div>
          <Separator />
          {isPending ? (
            <SkeletonPayment />
          ) : (
            reserve && (
              <div className=" bg-gray-100  p-4 rounded-md w-full">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Fecha:</span>
                  <span className="text-gray-900">
                    {formatDateUTC(reserve.date)}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Hora:</span>
                  <span className="text-gray-900">{reserve?.schedule}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Cancha:</span>
                  <span className="text-gray-900">Cancha {reserve?.court}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Monto Pagado:</span>
                  <span className="text-gray-900">
                    $
                    {reserve.reservationAmount!.toLocaleString("es-AR", {
                      currency: "ARS",
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Monto Faltante:</span>
                  <span className="text-gray-900">
                    $
                    {(
                      reserve.price! - reserve.reservationAmount!
                    ).toLocaleString("es-AR", {
                      currency: "ARS",
                    })}
                  </span>
                </div>
              </div>
            )
          )}
          <div className="w-full flex flex-col mt-6 gap-2 items-center justify-center">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center px-4 py-2 bg-Primary text-white rounded-md hover:shadow-lg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              prefetch={false}
            >
              Volver a la página principal
            </Link>
            <Link
              href="/profile"
              className="inline-flex w-full items-center justify-center px-2 py-1 bg-white text-Primary rounded-md shadow-sm hover:shadow-lg  border  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 "
              prefetch={false}
            >
              Ir a mis reservas
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function CircleCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
