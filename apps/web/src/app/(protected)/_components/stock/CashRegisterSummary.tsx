"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCashRegisterStore } from "@/store/cash-register";
import {
  getDailySummary,
  formatReportDate,
  DailySummaryResponse,
} from "@/services/reports/reports";
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  Loader2,
  Receipt,
  Calendar,
  ShoppingCart,
  DollarSign,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  TrendingUp,
  Clock,
  RefreshCw,
  Eye,
  EyeOff,
  Activity,
  CheckCircle,
  XCircle,
  Package,
  User,
  MapPin,
  Percent,
  Hash,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const PAYMENT_METHODS = [
  {
    key: "CASH",
    label: "Efectivo",
    value: 0,
    icon: Banknote,
    color: "text-green-600",
    bgColor: "bg-green-50",
  },
  {
    key: "CARD",
    label: "Tarjetas",
    value: 0,
    icon: CreditCard,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
  },
  {
    key: "TRANSFER",
    label: "Transferencias",
    value: 0,
    icon: ArrowRightLeft,
    color: "text-purple-600",
    bgColor: "bg-purple-50",
  },
  {
    key: "MERCADOPAGO",
    label: "Mercado Pago",
    value: 0,
    icon: DollarSign,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50",
  },
  {
    key: "OTHER",
    label: "Otros",
    value: 0,
    icon: Receipt,
    color: "text-gray-600",
    bgColor: "bg-gray-50",
  },
];

interface CashRegisterSummaryProps {
  dailySummaryData?: DailySummaryResponse | null;
}

export function CashRegisterSummary({ dailySummaryData }: CashRegisterSummaryProps) {
  const { activeSession, activeRegister } = useCashRegisterStore();
  const [dailySummary, setDailySummary] = useState<DailySummaryResponse | null>(
    dailySummaryData || null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (activeSession && activeRegister && !dailySummaryData) {
      loadDailySummary();
    }
  }, [activeSession, activeRegister]);

  const loadDailySummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = formatReportDate(new Date());
      const complexId = activeRegister?.complexId;
      if (!complexId) throw new Error("No se encontró el complejo");
      const result = await getDailySummary(today, complexId, activeSession?.id || "");
      if (result.success && result.data) {
        setDailySummary(result.data);
      } else {
        setError(result.error || "Error al cargar el resumen diario");
      }
    } catch (err: any) {
      setError(err.message || "Error al cargar el resumen diario");
    } finally {
      setLoading(false);
    }
  };

  if (!activeSession || !activeRegister) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Atención</AlertTitle>
        <AlertDescription>
          No hay una sesión de caja activa. No se puede mostrar el resumen.
        </AlertDescription>
      </Alert>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!dailySummary) return null;

  // Totales y breakdowns del reporte
  const totals = dailySummary.totals;
  const paymentMethods = totals.paymentMethodSummary;
  const courts = dailySummary.courts;
  const products = dailySummary.products;
  return (
    <div className="space-y-3 md:space-y-4 lg:space-y-6">
      {/* Header con información de sesión */}
      <Card className="border-2 border-primary/20">
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg lg:text-xl">
                <Receipt className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary flex-shrink-0" />
                <span className="truncate">Resumen de Caja - {activeRegister.name}</span>
              </CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Sesión iniciada: {format(new Date(activeSession.startAt), "PPPp", { locale: es })}
              </p>
            </div>
            <div className="w-full sm:w-auto text-left sm:text-right">
              <Badge
                variant={activeSession.status === "ACTIVE" ? "default" : "secondary"}
                className="text-xs sm:text-sm"
              >
                {activeSession.status === "ACTIVE" ? (
                  <>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Activa
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3 mr-1" />
                    Cerrada
                  </>
                )}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">
                {activeSession.status === "ACTIVE"
                  ? `Activa por ${Math.floor(
                      (new Date().getTime() - new Date(activeSession.startAt).getTime()) /
                        (1000 * 60 * 60)
                    )}h`
                  : "Sesión cerrada"}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>{" "}
      {/* Métricas principales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Ingresos Totales
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-green-600 truncate">
                  ${totals.totalRevenue.toFixed(2)}
                </p>
                <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
                  <p className="truncate">Reservas: ${totals.totalRevenueReserves.toFixed(2)}</p>
                  <p className="truncate">Productos: ${totals.totalRevenueProducts.toFixed(2)}</p>
                </div>
              </div>
              <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">Reservas</p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-purple-600">
                  {totals.totalReservations}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Ingresos: ${totals.totalRevenueReserves.toFixed(2)}
                </p>
              </div>
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                  Productos Vendidos
                </p>
                <p className="text-lg sm:text-xl lg:text-2xl font-bold text-orange-600">
                  {totals.totalProductsSold}
                </p>
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  Ingresos: ${totals.totalRevenueProducts.toFixed(2)}
                </p>
              </div>
              <ShoppingCart className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500 flex-shrink-0" />
            </div>
          </CardContent>
        </Card>
      </div>{" "}
      {/* Métodos de pago */}
      <Card>
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <CreditCard className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Ingresos por Método de Pago</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {paymentMethods.map((pm: any) => {
              const methodConfig =
                PAYMENT_METHODS.find((m) => m.key === pm.method) ||
                PAYMENT_METHODS[PAYMENT_METHODS.length - 1];
              const IconComponent = methodConfig.icon;
              const color = methodConfig.color;
              const bgColor = methodConfig.bgColor;
              const percentage =
                totals.totalRevenue > 0 ? (pm.amount / totals.totalRevenue) * 100 : 0;

              return (
                <Card
                  key={pm.method}
                  className={`${bgColor} border-0 hover:shadow-md transition-shadow`}
                >
                  <CardContent className="p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <IconComponent className={`h-4 w-4 sm:h-5 sm:w-5 ${color} flex-shrink-0`} />
                      <Badge variant="outline" className="text-xs">
                        {percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-medium text-gray-600 truncate">
                        {methodConfig.label}
                      </p>
                      <p className={`text-sm sm:text-base lg:text-lg font-bold ${color} truncate`}>
                        ${pm.amount.toFixed(2)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>{" "}
      {/* Resumen de canchas y productos */}
      <Card>
        <CardHeader className="p-3 sm:p-4 lg:p-6">
          <CardTitle className="flex items-center gap-2 text-sm sm:text-base lg:text-lg">
            <Package className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
            <span className="truncate">Canchas y Productos Destacados</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-4 lg:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Canchas */}
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-3">Canchas</h4>
              <div className="space-y-3">
                {courts.map((court: any) => {
                  const pendiente = Math.max(0, court.totalRevenue - court.totalPaid);
                  const pendienteColor =
                    pendiente > 0
                      ? "bg-red-100 text-red-700 border-red-300"
                      : "bg-green-100 text-green-700 border-green-300";

                  return (
                    <div
                      key={court.courtId}
                      className="rounded-lg border p-3 sm:p-4 bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col gap-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                              <span className="font-bold text-primary text-sm sm:text-base truncate">
                                {court.courtName}
                              </span>
                              <span className="text-xs text-gray-500 truncate">
                                ({court.sportTypeName})
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                              <Badge variant="outline" className="text-xs">
                                Reservas: {court.totalReservations}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                ${court.totalRevenue.toFixed(2)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Pagado: ${court.totalPaid.toFixed(2)}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                Ocupación:{" "}
                                {court.totalReservations > 0
                                  ? ((court.totalReservations / 24) * 100).toFixed(0)
                                  : 0}
                                %
                              </Badge>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                              {court.paymentsByMethod.map((pm: any) => (
                                <Badge key={pm.method} variant="secondary" className="text-xs">
                                  {pm.method}: ${pm.amount.toFixed(2)}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div className="flex-shrink-0 flex flex-col items-start sm:items-end gap-1 min-w-[90px]">
                            <span
                              className={`rounded-lg px-2 py-1 border text-xs font-bold ${pendienteColor}`}
                            >
                              {pendiente > 0 ? `Pendiente $${pendiente.toFixed(2)}` : "Pagado"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-1">
                          <span className="text-xs text-muted-foreground">Reservas recientes:</span>
                          <ul className="text-xs ml-1 sm:ml-2 mt-1 max-h-24 overflow-y-auto space-y-1">
                            {court.reservations.slice(0, 3).map((res: any) => {
                              const faltaPagar = Math.max(0, res.price - res.totalPaid);
                              return (
                                <li
                                  key={res.id}
                                  className={`flex flex-wrap gap-1 items-center border-b last:border-b-0 py-1 ${faltaPagar > 0 ? "font-semibold text-red-700" : "font-semibold text-green-700"}`}
                                >
                                  <span className="truncate max-w-[80px]">
                                    {res.clientName || "-"}
                                  </span>
                                  <span className="text-muted-foreground text-xs">
                                    {res.schedule}
                                  </span>{" "}
                                  <span className="text-xs">${res.totalPaid.toFixed(2)}</span>
                                  {faltaPagar > 0 && (
                                    <span className="rounded px-1 py-0.5 border text-xs bg-red-100 text-red-700 border-red-300">
                                      Falta: ${faltaPagar.toFixed(2)}
                                    </span>
                                  )}
                                </li>
                              );
                            })}
                            {court.reservations.length > 3 && (
                              <li className="text-muted-foreground">
                                ...y {court.reservations.length - 3} más
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Productos */}
            <div>
              <h4 className="font-semibold text-sm sm:text-base mb-3">Productos</h4>
              <div className="space-y-3">
                {products.map((prod: any) => {
                  const ventasConDescuento = prod.sales.filter(
                    (s: any) => s.discount && s.discount > 0
                  ).length;
                  const regalos = prod.sales.filter((s: any) => s.isGift).length;

                  // Breakdown por método de pago
                  const pagosPorMetodo: Record<string, { amount: number; count: number }> = {};
                  prod.sales.forEach((s: any) => {
                    if (!pagosPorMetodo[s.paymentMethod]) {
                      pagosPorMetodo[s.paymentMethod] = { amount: 0, count: 0 };
                    }
                    pagosPorMetodo[s.paymentMethod].amount += s.price * s.quantity;
                    pagosPorMetodo[s.paymentMethod].count += 1;
                  });

                  return (
                    <div
                      key={prod.productId}
                      className="rounded-lg border p-3 sm:p-4 bg-white shadow-sm transition-all hover:shadow-md"
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <span className="font-bold text-primary text-sm sm:text-base truncate">
                            {prod.productName}
                          </span>
                          <div className="flex flex-wrap gap-1">
                            <Badge variant="outline" className="text-xs">
                              Vendidos: {prod.totalQuantity}
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              ${prod.totalRevenue.toFixed(2)}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1">
                          <Badge variant="secondary" className="text-xs">
                            Descuentos: {ventasConDescuento}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Regalos: {regalos}
                          </Badge>
                        </div>

                        <div className="mt-1 flex flex-wrap gap-1">
                          {Object.entries(pagosPorMetodo).map(([method, val]) => (
                            <Badge key={method} variant="secondary" className="text-xs">
                              {method}: ${val.amount.toFixed(2)}
                            </Badge>
                          ))}
                        </div>

                        <div className="mt-1">
                          <span className="text-xs text-muted-foreground">Ventas recientes:</span>
                          <ul className="text-xs ml-1 sm:ml-2 mt-1 max-h-24 overflow-y-auto space-y-1">
                            {prod.sales.slice(0, 3).map((sale: any) => (
                              <li
                                key={sale.id}
                                className="flex flex-wrap gap-1 items-center border-b last:border-b-0 py-1"
                              >
                                <span>
                                  {format(new Date(sale.soldAt), "HH:mm", { locale: es })}
                                </span>
                                <span>
                                  ${sale.price.toFixed(2)} x{sale.quantity}
                                </span>
                                {sale.discount && sale.discount > 0 && (
                                  <span className="text-green-700">-{sale.discount}%</span>
                                )}
                                {sale.isGift && <span className="text-orange-700">Regalo</span>}
                              </li>
                            ))}
                            {prod.sales.length > 3 && (
                              <li className="text-muted-foreground">
                                ...y {prod.sales.length - 3} más
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button
          onClick={loadDailySummary}
          variant="outline"
          size="sm"
          className="flex items-center gap-2 flex-1 sm:flex-none"
        >
          <RefreshCw className="h-4 w-4" />
          Actualizar
        </Button>
        <Button
          onClick={() => setShowDetails(!showDetails)}
          variant={showDetails ? "secondary" : "default"}
          size="sm"
          className="flex items-center gap-2 flex-1 sm:flex-none"
        >
          {showDetails ? (
            <>
              <EyeOff className="h-4 w-4" /> Ocultar
            </>
          ) : (
            <>
              <Eye className="h-4 w-4" /> Ver Detalles
            </>
          )}
        </Button>
      </div>
      {/* Detalles extendidos */}
      {showDetails && (
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
              Detalle de Reservas y Ventas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-2">
            <div className="overflow-auto max-h-[500px]">
              <Table className="min-w-[600px]">
                <TableHeader className="sticky top-0 bg-background">
                  <TableRow className="bg-muted/50">
                    <TableHead className="w-[120px]">Fecha/Hora</TableHead>
                    <TableHead className="w-[100px]">Tipo</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="w-[100px]">Monto</TableHead>
                    <TableHead className="w-[120px]">Método</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courts.flatMap((court: any) =>
                    court.reservations.map((res: any) => (
                      <TableRow key={res.id}>
                        <TableCell className="py-2">{res.schedule}</TableCell>
                        <TableCell className="py-2">Reserva</TableCell>
                        <TableCell className="py-2 truncate max-w-[200px]">
                          {res.clientName || "-"} - {court.courtName}
                        </TableCell>
                        <TableCell className="py-2">${res.totalPaid.toFixed(2)}</TableCell>
                        <TableCell className="py-2">Efectivo</TableCell>
                      </TableRow>
                    ))
                  )}
                  {products.flatMap((prod: any) =>
                    prod.sales.map((sale: any) => (
                      <TableRow key={sale.id}>
                        <TableCell className="py-2">
                          {format(new Date(sale.soldAt), "HH:mm", { locale: es })}
                        </TableCell>
                        <TableCell className="py-2">Producto</TableCell>
                        <TableCell className="py-2 truncate max-w-[200px]">
                          {prod.productName} x{sale.quantity}
                        </TableCell>
                        <TableCell className="py-2">
                          ${(sale.quantity * sale.price).toFixed(2)}
                        </TableCell>
                        <TableCell className="py-2 truncate">{sale.paymentMethod}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
