"use client";

import { Card } from "@/components/ui/card";
import { Users, UserCheck, UserX, Crown, Info, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TopCustomer {
    userId: string;
    name: string;
    phone: string | null;
    totalSpent: number;
    reservations: number;
    averageTicket: number;
}

interface CustomerSegmentation {
    newCustomers: number;
    returningCustomers: number;
    totalCustomers: number;
    newCustomerPercentage: number;
}

interface InactiveCustomer {
    userId: string;
    name: string;
    phone: string | null;
    lastReserveDate: Date;
    daysSinceLastReserve: number;
}

interface ProblematicCustomer {
    userId: string;
    name: string;
    phone: string | null;
    totalReservations: number;
    canceledReservations: number;
    rejectedReservations: number;
    approvedReservations: number;
    cancellationRate: number;
    rejectionRate: number;
    problemScore: number;
}

interface CustomerAnalysisCardProps {
    topCustomers: TopCustomer[];
    customerSegmentation: CustomerSegmentation;
    inactiveCustomers: InactiveCustomer[];
    problematicCustomers: ProblematicCustomer[];
}

export function CustomerAnalysisCard({
    topCustomers,
    customerSegmentation,
    inactiveCustomers,
    problematicCustomers,
}: CustomerAnalysisCardProps) {
    const formatPhone = (phone: string | null) => {
        if (!phone) return "Sin teléfono";
        const cleaned = phone.replace(/\D/g, '');
        if (cleaned.length >= 10) {
            const areaCode = cleaned.slice(-10, -7);
            const firstPart = cleaned.slice(-7, -4);
            const secondPart = cleaned.slice(-4);
            return `(${areaCode}) ${firstPart}-${secondPart}`;
        }
        return phone;
    };

    return (
        <TooltipProvider>
            <Card className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h3 className="text-lg font-semibold">Análisis de Clientes</h3>
                        <p className="text-sm text-muted-foreground">
                            Top gastadores, segmentación, inactivos y problemáticos
                        </p>
                    </div>
                    <Users className="h-5 w-5 text-blue-600" />
                </div>

                {/* Segmentation Summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                    <div className="p-3 rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200">
                        <p className="text-xs text-muted-foreground mb-1">Total Clientes</p>
                        <p className="text-2xl font-bold text-blue-900">
                            {customerSegmentation.totalCustomers}
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-green-50 to-green-100 border border-green-200">
                        <p className="text-xs text-muted-foreground mb-1">Nuevos</p>
                        <p className="text-2xl font-bold text-green-900">
                            {customerSegmentation.newCustomers}
                        </p>
                        <p className="text-xs text-green-700">
                            {customerSegmentation.newCustomerPercentage}%
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200">
                        <p className="text-xs text-muted-foreground mb-1">Recurrentes</p>
                        <p className="text-2xl font-bold text-purple-900">
                            {customerSegmentation.returningCustomers}
                        </p>
                    </div>
                    <div className="p-3 rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200">
                        <p className="text-xs text-muted-foreground mb-1">Inactivos</p>
                        <p className="text-2xl font-bold text-amber-900">
                            {inactiveCustomers.length}
                        </p>
                    </div>
                </div>

                <Tabs defaultValue="top-customers" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="top-customers" className="text-xs sm:text-sm">
                            <Crown className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Top
                        </TabsTrigger>
                        <TabsTrigger value="inactive" className="text-xs sm:text-sm">
                            <UserX className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Inactivos
                            {inactiveCustomers.length > 0 && (
                                <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">
                                    {inactiveCustomers.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                        <TabsTrigger value="problematic" className="text-xs sm:text-sm">
                            <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                            Problemáticos
                            {problematicCustomers.length > 0 && (
                                <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">
                                    {problematicCustomers.length}
                                </Badge>
                            )}
                        </TabsTrigger>
                    </TabsList>

                    {/* Top Customers */}
                    <TabsContent value="top-customers" className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">Mejores Clientes</p>
                                    <p className="text-xs">
                                        Los clientes que más gastaron en el período. Identifica a tus clientes VIP
                                        para ofrecerles beneficios especiales y fortalecer la relación.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                            <span className="text-xs text-muted-foreground">
                                Top 10 por gasto total
                            </span>
                        </div>

                        {topCustomers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <Users className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">No hay datos de clientes</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {topCustomers.map((customer, index) => (
                                    <div
                                        key={customer.userId}
                                        className="p-3 rounded-lg border bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:border-blue-200 transition-colors"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-start gap-2 flex-1">
                                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 text-white text-xs font-bold flex-shrink-0">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-sm truncate">{customer.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatPhone(customer.phone)}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <Badge variant="outline" className="text-[10px] px-1">
                                                            {customer.reservations} reservas
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">
                                                            Ticket prom: ${customer.averageTicket.toLocaleString("es-AR")}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right ml-2">
                                                <p className="text-lg font-bold text-green-700">
                                                    ${customer.totalSpent.toLocaleString("es-AR")}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>

                    {/* Inactive Customers */}
                    <TabsContent value="inactive" className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">Clientes Inactivos</p>
                                    <p className="text-xs">
                                        Clientes que no reservan hace más de 30 días. Considera enviarles una
                                        promoción especial para reactivarlos (ej: 20% OFF en su próxima reserva).
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                            <span className="text-xs text-muted-foreground">
                                Sin reservas en 30+ días
                            </span>
                        </div>

                        {inactiveCustomers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <UserCheck className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">✅ No hay clientes inactivos</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {inactiveCustomers.slice(0, 8).map((customer) => {
                                        const daysColor =
                                            customer.daysSinceLastReserve > 90
                                                ? "bg-red-100 text-red-900 border-red-300"
                                                : customer.daysSinceLastReserve > 60
                                                    ? "bg-orange-100 text-orange-900 border-orange-300"
                                                    : "bg-amber-100 text-amber-900 border-amber-300";

                                        return (
                                            <div
                                                key={customer.userId}
                                                className="p-3 rounded-lg border bg-gray-50"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{customer.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatPhone(customer.phone)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            Última reserva: {new Date(customer.lastReserveDate).toLocaleDateString("es-AR")}
                                                        </p>
                                                    </div>
                                                    <Badge variant="outline" className={`${daysColor} ml-2`}>
                                                        {customer.daysSinceLastReserve} días
                                                    </Badge>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {inactiveCustomers.length > 8 && (
                                    <p className="text-xs text-center text-muted-foreground pt-2">
                                        +{inactiveCustomers.length - 8} clientes más inactivos
                                    </p>
                                )}

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <p className="text-xs text-blue-900">
                                        💡 <strong>Sugerencia:</strong> Envía un mensaje personalizado con un descuento
                                        exclusivo para reactivar estos clientes. Ej: "¡Te extrañamos! 20% OFF en tu próxima reserva"
                                    </p>
                                </div>
                            </>
                        )}
                    </TabsContent>

                    {/* Problematic Customers */}
                    <TabsContent value="problematic" className="space-y-3 mt-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Info className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-medium mb-1">Clientes Problemáticos</p>
                                    <p className="text-xs">
                                        Clientes con alta tasa de cancelaciones o rechazos. Considera requerir
                                        seña obligatoria o limitar reservas para evitar pérdidas.
                                    </p>
                                </TooltipContent>
                            </Tooltip>
                            <span className="text-xs text-muted-foreground">
                                Alta cancelación/rechazo
                            </span>
                        </div>

                        {problematicCustomers.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                                <UserCheck className="h-12 w-12 mb-2 opacity-20" />
                                <p className="text-sm">✅ No hay clientes problemáticos</p>
                            </div>
                        ) : (
                            <>
                                <div className="space-y-2">
                                    {problematicCustomers.slice(0, 10).map((customer) => {
                                        const severity =
                                            customer.rejectionRate > 50 || customer.cancellationRate > 70
                                                ? "critical"
                                                : customer.rejectionRate > 30 || customer.cancellationRate > 50
                                                    ? "high"
                                                    : "medium";

                                        const borderColor =
                                            severity === "critical"
                                                ? "border-red-300 bg-red-50"
                                                : severity === "high"
                                                    ? "border-orange-300 bg-orange-50"
                                                    : "border-amber-300 bg-amber-50";

                                        return (
                                            <div
                                                key={customer.userId}
                                                className={`p-3 rounded-lg border ${borderColor}`}
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium text-sm truncate">{customer.name}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {formatPhone(customer.phone)}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                                            <Badge variant="outline" className="text-[10px] px-1">
                                                                {customer.totalReservations} total
                                                            </Badge>
                                                            {customer.canceledReservations > 0 && (
                                                                <Badge variant="outline" className="text-[10px] px-1 bg-red-100 text-red-900 border-red-300">
                                                                    {customer.canceledReservations} canceladas ({customer.cancellationRate}%)
                                                                </Badge>
                                                            )}
                                                            {customer.rejectedReservations > 0 && (
                                                                <Badge variant="outline" className="text-[10px] px-1 bg-orange-100 text-orange-900 border-orange-300">
                                                                    {customer.rejectedReservations} rechazadas ({customer.rejectionRate}%)
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {problematicCustomers.length > 10 && (
                                    <p className="text-xs text-center text-muted-foreground pt-2">
                                        +{problematicCustomers.length - 10} clientes más problemáticos
                                    </p>
                                )}

                                <div className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
                                    <p className="text-xs text-red-900">
                                        ⚠️ <strong>Sugerencia:</strong> Para clientes con alta tasa de cancelación/rechazo,
                                        considera: (1) Requerir seña obligatoria, (2) Limitar reservas simultáneas,
                                        (3) Contactarlos para entender el problema.
                                    </p>
                                </div>
                            </>
                        )}
                    </TabsContent>
                </Tabs>
            </Card>
        </TooltipProvider>
    );
}
