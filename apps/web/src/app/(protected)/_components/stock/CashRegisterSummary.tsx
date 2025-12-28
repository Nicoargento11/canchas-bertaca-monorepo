"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  RefreshCw,
  Package,
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const PAYMENT_METHODS = [
  {
    key: "CASH",
    label: "Efectivo",
    value: 0,
    icon: Banknote,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-900/20",
  },
  {
    key: "CARD",
    label: "Tarjetas",
    value: 0,
    icon: CreditCard,
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
  },
  {
    key: "TRANSFER",
    label: "Transferencias",
    value: 0,
    icon: ArrowRightLeft,
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-900/20",
  },
  {
    key: "MERCADOPAGO",
    label: "Mercado Pago",
    value: 0,
    icon: DollarSign,
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-900/20",
  },
  {
    key: "OTHER",
    label: "Otros",
    value: 0,
    icon: Receipt,
    color: "text-gray-600",
    bgColor: "bg-gray-50 dark:bg-gray-800/50",
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
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

  const totals = dailySummary.totals;
  const paymentMethods = totals.paymentMethodSummary;
  const courts = dailySummary.courts;
  const products = dailySummary.products;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Resumen del Día</h2>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
          </p>
        </div>
        <Button onClick={loadDailySummary} variant="outline" size="icon" title="Actualizar datos">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-muted/50">
          <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">General</TabsTrigger>
          <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Detalles</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Main Stats */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="col-span-2 bg-primary/5 border-primary/20">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Ingresos Totales</p>
                  <h3 className="text-3xl font-bold text-primary mt-1">
                    ${totals.totalRevenue.toFixed(2)}
                  </h3>
                </div>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm font-medium">Reservas</span>
                </div>
                <p className="text-2xl font-bold">${totals.totalRevenueReserves.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totals.totalReservations} reservas
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ShoppingCart className="h-4 w-4 text-orange-500" />
                  <span className="text-sm font-medium">Productos</span>
                </div>
                <p className="text-2xl font-bold">${totals.totalRevenueProducts.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {totals.totalProductsSold} vendidos
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Payment Methods */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground">Métodos de Pago</h3>
            <div className="grid gap-3">
              {paymentMethods.map((pm: any) => {
                const methodConfig =
                  PAYMENT_METHODS.find((m) => m.key === pm.method) ||
                  PAYMENT_METHODS[PAYMENT_METHODS.length - 1];
                const IconComponent = methodConfig.icon;

                return (
                  <div
                    key={pm.method}
                    className={`flex items-center justify-between p-3 rounded-lg border ${methodConfig.bgColor} border-transparent`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full bg-white/50 dark:bg-black/10`}>
                        <IconComponent className={`h-4 w-4 ${methodConfig.color}`} />
                      </div>
                      <span className="font-medium text-sm">{methodConfig.label}</span>
                    </div>
                    <span className="font-bold text-sm">${pm.amount.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="details" className="mt-4">
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6">
              {/* Courts Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Actividad en Canchas</h3>
                </div>
                {courts.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">
                    No hay actividad registrada.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {courts.map((court: any) => (
                      <Card key={court.courtId} className="overflow-hidden">
                        <div className="bg-muted/30 p-3 border-b">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium text-sm">{court.courtName}</span>
                            <Badge variant="secondary" className="text-xs">
                              ${court.totalRevenue.toFixed(2)}
                            </Badge>
                          </div>
                          {(() => {
                            const totalExpected = court.totalRevenue;
                            const totalPaid = court.reservations.reduce((sum: number, r: any) => sum + r.totalPaid, 0);
                            const remaining = totalExpected - totalPaid;
                            const isComplete = Math.abs(remaining) < 0.01;

                            return (
                              <div className="flex items-center gap-2 text-xs">
                                {isComplete ? (
                                  <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-xs">
                                    ✓ Completo
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive" className="text-xs">
                                    Falta: ${remaining.toFixed(2)}
                                  </Badge>
                                )}
                                <span className="text-muted-foreground">({court.reservations.length} reserva{court.reservations.length !== 1 ? 's' : ''})</span>
                              </div>
                            );
                          })()}
                        </div>
                        <CardContent className="p-3 space-y-2">
                          {court.reservations.map((res: any) => (
                            <div key={res.id} className="flex justify-between text-sm items-center">
                              <div className="flex flex-col">
                                <span className="font-medium text-xs">
                                  {res.clientName || "Cliente Casual"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {res.schedule}
                                </span>
                              </div>
                              <span className="font-medium text-xs">
                                ${res.totalPaid.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Products Section */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-semibold text-sm">Venta de Productos</h3>
                </div>
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground italic">No hay ventas registradas.</p>
                ) : (
                  <div className="space-y-3">
                    {products.map((prod: any) => (
                      <div
                        key={prod.productId}
                        className="flex items-center justify-between p-3 border rounded-lg bg-card"
                      >
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{prod.productName}</span>
                          <span className="text-xs text-muted-foreground">
                            {prod.totalQuantity} unidades
                          </span>
                        </div>
                        <span className="font-bold text-sm">${prod.totalRevenue.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
