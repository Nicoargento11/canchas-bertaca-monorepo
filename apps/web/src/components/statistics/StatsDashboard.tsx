"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { format, subDays } from "date-fns";
import {
    DollarSign,
    Calendar,
    ShoppingBag,
    Users,
    TrendingUp,
    ArrowDownLeft,
    Percent,
    Clock
} from "lucide-react";

import { PeriodSelector, PeriodType } from "./PeriodSelector";
import { MetricCard } from "./MetricCard";
import { RevenueChart } from "./RevenueChart";
import { TransactionsList, Transaction } from "./TransactionsList";
import { getDashboard } from "@/services/reports/reports";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/app/(protected)/[slug]/dashboard/DashboardHeader";

interface StatsDashboardProps {
    complexId: string;
    complexName: string;
}

export function StatsDashboard({ complexId, complexName }: StatsDashboardProps) {
    const [dateRange, setDateRange] = useState<DateRange | undefined>({
        from: subDays(new Date(), 6),
        to: new Date(),
    });
    const [period, setPeriod] = useState<PeriodType>("7d");
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch data when date range changes
    useEffect(() => {
        const fetchData = async () => {
            if (!dateRange?.from) return;

            setLoading(true);
            setError(null);

            try {
                const result = await getDashboard(
                    complexId,
                    format(dateRange.from, "yyyy-MM-dd"),
                    dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : format(dateRange.from, "yyyy-MM-dd")
                );

                if (result.success && result.data) {
                    setData(result.data);
                } else {
                    setError(result.error || "Error al cargar datos");
                }
            } catch (err) {
                setError("Error de conexión");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [dateRange, complexId]);

    const handlePeriodChange = (range: DateRange | undefined, newPeriod: PeriodType) => {
        setDateRange(range);
        setPeriod(newPeriod);
    };

    // Calculate totals from data
    const totalIngresos = data?.daily?.reduce((sum: number, d: any) => sum + d.ingresos, 0) || 0;
    const totalReservas = data?.daily?.reduce((sum: number, d: any) => sum + d.reservas, 0) || 0;
    const totalEgresos = data?.totalEgresos || 0;
    const promotionsUsed = data?.promotionsUsed || 0;
    const reservasFijas = data?.reservasFijas || 0;
    const avgOcupacion = data?.daily?.length > 0
        ? Math.round(data.daily.reduce((sum: number, d: any) => sum + d.ocupacion, 0) / data.daily.length)
        : 0;

    // Previous totals for comparison
    const prevIngresos = data?.previousIngresos || 0;
    const prevReservas = data?.previousReservas || 0;
    const prevEgresos = data?.previousEgresos || 0;

    const calculateChange = (current: number, previous: number) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const ingresosChange = calculateChange(totalIngresos, prevIngresos);
    const reservasChange = calculateChange(totalReservas, prevReservas);
    const egresosChange = calculateChange(totalEgresos, prevEgresos);

    // Parse transactions dates
    const recentTransactions: Transaction[] = (data?.recentTransactions || []).map((t: any) => ({
        ...t,
        date: new Date(t.date),
    }));

    if (loading) {
        return (
            <div className="p-4 sm:p-6 space-y-6">
                <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-64" />
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
                <Skeleton className="h-80" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 space-y-6 bg-muted/10 min-h-screen">
            {/* Header */}
            <DashboardHeader title="Estadísticas" />

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{complexName}</h1>
                    <p className="text-muted-foreground text-sm">
                        Panel de estadísticas y métricas
                    </p>
                </div>
                <PeriodSelector value={dateRange} selectedPeriod={period} onChange={handlePeriodChange} />
            </div>

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Main metric - larger */}
                <div className="col-span-2">
                    <MetricCard
                        title="Ingresos Totales"
                        value={`$${totalIngresos.toLocaleString("es-AR")}`}
                        icon={<DollarSign className="h-5 w-5 text-emerald-600" />}
                        size="lg"
                        variant="success"
                        change={ingresosChange}
                        changeLabel="vs período anterior"
                    />
                </div>

                {/* Secondary metrics */}
                <MetricCard
                    title="Reservas"
                    value={totalReservas}
                    icon={<Calendar className="h-5 w-5 text-blue-600" />}
                    change={reservasChange}
                />

                <MetricCard
                    title="Egresos"
                    value={`-$${totalEgresos.toLocaleString("es-AR")}`}
                    icon={<ArrowDownLeft className="h-5 w-5 text-red-500" />}
                    variant="danger"
                    change={egresosChange}
                />
            </div>

            {/* Charts and Transactions Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Revenue Chart - takes 2 columns */}
                <div className="lg:col-span-2">
                    <RevenueChart
                        data={data?.daily || []}
                        title="Ingresos y Reservas por Día"
                    />
                </div>

                {/* Transactions List */}
                <div className="lg:col-span-1">
                    <TransactionsList
                        transactions={recentTransactions}
                        maxHeight={280}
                    />
                </div>
            </div>

            {/* Bottom metrics row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    title="Promociones Usadas"
                    value={promotionsUsed}
                    icon={<Percent className="h-5 w-5 text-purple-600" />}
                />

                <MetricCard
                    title="Ocupación Promedio"
                    value={`${avgOcupacion}%`}
                    icon={<TrendingUp className="h-5 w-5 text-amber-600" />}
                />

                <MetricCard
                    title="Reservas Fijas"
                    value={reservasFijas}
                    icon={<Clock className="h-5 w-5 text-blue-600" />}
                    changeLabel="fijos activos"
                />

                <MetricCard
                    title="Productos Vendidos"
                    value={data?.products?.reduce((sum: number, p: any) => sum + p.sales, 0) || 0}
                    icon={<ShoppingBag className="h-5 w-5 text-orange-600" />}
                />
            </div>
        </div>
    );
}
