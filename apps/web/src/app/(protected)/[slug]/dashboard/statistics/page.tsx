"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { getComplexBySlug } from "@/services/complex/complex";
import { StatsDashboard } from "@/components/statistics";
import { Skeleton } from "@/components/ui/skeleton";

// Re-export DashboardData for backwards compatibility
export interface DashboardData {
  daily: { day: string; reservas: number; ingresos: number; diaAnterior: number; cancelaciones: number; ocupacion: number; clientesNuevos: number; }[];
  weekly: { week: string; reservas: number; ingresos: number; semanaAnterior: number; ocupacion: number; clientesNuevos: number; }[];
  monthly: { month: string; reservas: number; ingresos: number; mesAnterior: number; ocupacion: number; clientesNuevos: number; }[];
  products: { name: string; sales: number; category: string; }[];
  paymentMethods: { name: string; value: number; }[];
  canchas: { name: string; reservas: number; }[];
  horarios: { hora: string; reservas: number; }[];
  totalEgresos: number;
  promotionsUsed: number;
  reservasFijas: number;
  reservasNormales: number;
  previousIngresos: number;
  previousReservas: number;
  previousEgresos: number;
  recentTransactions: {
    id: string;
    type: "reserva" | "venta" | "egreso" | "pago";
    description: string;
    amount: number;
    date: Date;
    status: string;
  }[];
}

export default function StatisticsPage() {
  const pathname = usePathname();
  const slug = pathname.split("/")[1];
  const [complex, setComplex] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComplex = async () => {
      try {
        const result = await getComplexBySlug(slug);
        if (result.data) {
          setComplex(result.data);
        } else {
          setError("No se encontró el complejo");
        }
      } catch (err) {
        setError("Error al cargar el complejo");
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchComplex();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !complex) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error || "Error desconocido"}
        </div>
      </div>
    );
  }

  return (
    <StatsDashboard
      complexId={complex.id}
      complexName={complex.name || "Complejo Deportivo"}
    />
  );
}
