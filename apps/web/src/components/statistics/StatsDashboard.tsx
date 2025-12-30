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

import { PeriodSelector, Period, PeriodMode } from "./PeriodSelector";
import { MetricCard } from "./MetricCard";
import { RevenueChart } from "./RevenueChart";
import { TransactionsList, Transaction } from "./TransactionsList";
import { CourtPerformanceCard } from "./CourtPerformanceCard";
import { TimeSlotHeatMap } from "./TimeSlotHeatMap";
import { ProductsAnalysisCard } from "./ProductsAnalysisCard";
import { PaymentMethodsCard } from "./PaymentMethodsCard";
import { ClientMetricsCard } from "./ClientMetricsCard";
import { BusinessKPIsCard } from "./BusinessKPIsCard";
import { ProductInventoryCard } from "./ProductInventoryCard";
import { CustomerAnalysisCard } from "./CustomerAnalysisCard";
import { getDashboard } from "@/services/reports/reports";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardHeader } from "@/app/(protected)/[slug]/dashboard/DashboardHeader";

interface StatsDashboardProps {
    complexId: string;
    complexName: string;
}

export function StatsDashboard({ complexId, complexName }: StatsDashboardProps) {
    const now = new Date();
    const getWeekOfMonth = (date: Date) => {
        const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
        const dayOfMonth = date.getDate();
        return Math.ceil((dayOfMonth + firstDay.getDay()) / 7);
    };

    const [period1, setPeriod1] = useState<Period>({
        mode: "day",
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        week: getWeekOfMonth(now),
    });
    const [period2, setPeriod2] = useState<Period | null>(null);
    const [dateStrings, setDateStrings] = useState({ start: "", end: "" });
    const [loading, setLoading] = useState(true);
    const [data1, setData1] = useState<any>(null);
    const [data2, setData2] = useState<any>(null);
    const [isComparing, setIsComparing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Convert Period to date strings
    const periodToDateStrings = (period: Period): { start: string; end: string } => {
        const { mode, year, month, week, day } = period;

        if (mode === "day" && month && day) {
            const date = new Date(year, month - 1, day);
            const dateStr = format(date, "yyyy-MM-dd");
            return { start: dateStr, end: dateStr };
        }

        if (mode === "week" && month && week) {
            const firstDayOfMonth = new Date(year, month - 1, 1);
            const firstWeekStart = 1;
            const weekStartDay = firstWeekStart + (week - 1) * 7;
            const weekEndDay = Math.min(weekStartDay + 6, new Date(year, month, 0).getDate());

            return {
                start: format(new Date(year, month - 1, weekStartDay), "yyyy-MM-dd"),
                end: format(new Date(year, month - 1, weekEndDay), "yyyy-MM-dd"),
            };
        }

        if (mode === "month" && month) {
            const firstDay = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0);
            return {
                start: format(firstDay, "yyyy-MM-dd"),
                end: format(lastDay, "yyyy-MM-dd"),
            };
        }

        if (mode === "year") {
            return {
                start: `${year}-01-01`,
                end: `${year}-12-31`,
            };
        }

        return { start: format(new Date(), "yyyy-MM-dd"), end: format(new Date(), "yyyy-MM-dd") };
    };

    // Fetch data when period changes
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError(null);

            try {
                const dates = periodToDateStrings(period1);
                setDateStrings(dates);

                const result = await getDashboard(complexId, dates.start, dates.end);

                if (result.success && result.data) {
                    setData1(result.data);
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
    }, [period1, complexId]);

    const handlePeriodChange = (p1: Period) => {
        setPeriod1(p1);
    };

    // Format period for display
    const formatPeriodLabel = (period: Period): string => {
        const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

        if (period.mode === "day" && period.day && period.month) {
            return `${period.day} ${months[period.month - 1]} ${period.year}`;
        }
        if (period.mode === "week" && period.week && period.month) {
            return `Sem ${period.week} ${months[period.month - 1]} ${period.year}`;
        }
        if (period.mode === "month" && period.month) {
            return `${months[period.month - 1]} ${period.year}`;
        }
        if (period.mode === "year") {
            return `${period.year}`;
        }
        return "Período";
    };

    // Calculate totals from data (use data1 as primary)
    const data = data1; // Backward compatibility
    const totalIngresos = data1?.daily?.reduce((sum: number, d: any) => sum + d.ingresos, 0) || 0;
    const totalReservas = data1?.daily?.reduce((sum: number, d: any) => sum + d.reservas, 0) || 0;
    const totalEgresos = data1?.totalEgresos || 0;
    const promotionsUsed = data?.promotionsUsed || 0;
    const reservasFijas = data?.reservasFijas || 0;
    const avgOcupacion = data?.daily?.length > 0
        ? Math.round(data.daily.reduce((sum: number, d: any) => sum + d.ocupacion, 0) / data.daily.length)
        : 0;

    // Manual comparison calculations
    const calculateChange = (current: number, previous: number) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    const getComparisonData = () => {
        // Always use automatic backend comparison
        const prevIngresos = data1?.previousIngresos || 0;
        const prevReservas = data1?.previousReservas || 0;
        const prevEgresos = data1?.previousEgresos || 0;

        return {
            ingresosChange: calculateChange(totalIngresos, prevIngresos),
            reservasChange: calculateChange(totalReservas, prevReservas),
            egresosChange: calculateChange(totalEgresos, prevEgresos),
            compareLabel: "vs período anterior",
        };
    };

    const comparison = getComparisonData();
    const { ingresosChange, reservasChange, egresosChange, compareLabel } = comparison;

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

            <div className="space-y-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">{complexName}</h1>
                    <p className="text-muted-foreground text-sm">
                        Panel de estadísticas y métricas
                    </p>
                </div>
                <PeriodSelector
                    onPeriodChange={handlePeriodChange}
                    currentMode={period1.mode}
                />
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
                        changeLabel={compareLabel}
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

            {/* Business KPIs - Prominent Placement */}
            <BusinessKPIsCard
                averageTicket={data?.averageTicket || 0}
                previousAverageTicket={data?.previousAverageTicket || 0}
                revenuePerHour={data?.revenuePerHour || 0}
                previousRevenuePerHour={data?.previousRevenuePerHour || 0}
                netMarginPercentage={data?.netMarginPercentage || 0}
                previousNetMarginPercentage={data?.previousNetMarginPercentage || 0}
                cancellationRate={data?.cancellationRate || 0}
                previousCancellationRate={data?.previousCancellationRate || 0}
                totalOccupancy={avgOcupacion}
            />

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

            {/* Court Performance and Time Slots */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <CourtPerformanceCard
                    courts={data?.canchas || []}
                    totalReservations={totalReservas}
                />
                <TimeSlotHeatMap horarios={data?.horarios || []} />
            </div>

            {/* Products and Payments Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ProductsAnalysisCard products={data?.products || []} />
                <PaymentMethodsCard paymentMethods={data?.paymentMethods || []} />
            </div>

            {/* Client Metrics */}
            <ClientMetricsCard dailyData={data?.daily || []} />

            {/* Product Inventory Analysis */}
            <ProductInventoryCard
                lowStockProducts={data?.lowStockProducts || []}
                highMarginProducts={data?.highMarginProducts || []}
                deadStockProducts={data?.deadStockProducts || []}
            />

            {/* Customer Analysis */}
            <CustomerAnalysisCard
                topCustomers={data?.topCustomers || []}
                customerSegmentation={data?.customerSegmentation || {
                    newCustomers: 0,
                    returningCustomers: 0,
                    totalCustomers: 0,
                    newCustomerPercentage: 0,
                }}
                inactiveCustomers={data?.inactiveCustomers || []}
                problematicCustomers={data?.problematicCustomers || []}
            />

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
