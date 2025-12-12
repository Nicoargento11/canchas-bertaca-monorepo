"use client";
import { getReserveById, Reserve } from "@/services/reserve/reserve";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function PaymentFailure() {
  const searchParams = useSearchParams();
  const params = useParams();
  const [reserve, setReserve] = useState<Reserve | null>();
  const complexSlug = params.slug as string;

  const reserveId = searchParams.get("external_reference");

  useEffect(() => {
    const fetchReserve = async () => {
      if (reserveId) {
        try {
          const { success, data, error } = await getReserveById(reserveId);
          if (!success || !data) {
            console.error("Error fetching reserve data:", error);
            return;
          }
          setReserve(data);
        } catch (error) {
          console.error("Error fetching reserve data:", error);
        }
      }
    };
    fetchReserve();
  }, [reserveId]);
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
      <div className="max-w-md p-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <div className="flex flex-col gap-2 items-center">
          <TriangleAlertIcon className="w-16 h-16 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-red-500">Oops, algo salió mal</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Lo sentimos, no pudimos procesar tu reserva. Por favor, intenta de nuevo o más tarde.
          </p>
          <div className="w-full flex flex-col gap-2">
            {reserve && (
              <Link
                href={reserve.paymentUrl!}
                className="inline-flex w-full items-center justify-center px-4 py-2 bg-gray-950 text-white rounded-md hover:shadow-lg hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                prefetch={false}
              >
                Volver a intentar el pago
              </Link>
            )}
            <Link
              href={`/`}
              className="inline-flex w-full items-center justify-center px-2 py-1 bg-white text-red-500 rounded-md shadow-sm hover:shadow-lg  border  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 "
              prefetch={false}
            >
              Volver al menu principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function TriangleAlertIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}
