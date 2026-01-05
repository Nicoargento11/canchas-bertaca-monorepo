"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CashSessionSummary, getSessionSummary } from "@/services/cash-session/cash-session";
import { Loader2, AlertCircle, DollarSign, CreditCard, ArrowRightLeft, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface CashSessionDetailsProps {
  sessionId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function CashSessionDetails({ sessionId, isOpen, onClose }: CashSessionDetailsProps) {
  const [summary, setSummary] = useState<CashSessionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = useMemo(() => {
    if (!summary?.payments) return null;

    const data = {
      reservations: {
        total: 0,
        methods: {} as Record<string, number>,
        count: 0,
        byCourtName: {} as Record<
          string,
          { total: number; methods: Record<string, number>; count: number }
        >,
      },
      sales: {
        total: 0,
        methods: {} as Record<string, number>,
        count: 0,
        byProduct: {} as Record<
          string,
          { total: number; methods: Record<string, number>; count: number }
        >,
      },
      expenses: { total: 0, methods: {} as Record<string, number>, count: 0 },
      others: { total: 0, methods: {} as Record<string, number>, count: 0 },
    };

    summary.payments.forEach((p: any) => {
      let type: keyof typeof data = "others";

      const tType = p.transactionType;

      if (p.reserve || tType === "RESERVA") {
        type = "reservations";
        // Agrupar por cancha
        const courtName = p.reserve?.court?.name || "Cancha sin identificar";
        if (!data.reservations.byCourtName[courtName]) {
          data.reservations.byCourtName[courtName] = { total: 0, methods: {}, count: 0 };
        }
        data.reservations.byCourtName[courtName].total += p.amount;
        data.reservations.byCourtName[courtName].count += 1;
        data.reservations.byCourtName[courtName].methods[p.method] =
          (data.reservations.byCourtName[courtName].methods[p.method] || 0) + p.amount;
      } else if (p.sale || tType === "VENTA_PRODUCTO") {
        type = "sales";
        // Agrupar por producto
        if (p.sale?.productSales) {
          p.sale.productSales.forEach((ps: any) => {
            const productName = ps.product?.name || "Producto sin identificar";
            const productAmount = p.amount / p.sale.productSales.length; // Prorrateo simple

            if (!data.sales.byProduct[productName]) {
              data.sales.byProduct[productName] = { total: 0, methods: {}, count: 0 };
            }
            data.sales.byProduct[productName].total += productAmount;
            data.sales.byProduct[productName].count += ps.quantity;
            data.sales.byProduct[productName].methods[p.method] =
              (data.sales.byProduct[productName].methods[p.method] || 0) + productAmount;
          });
        }
      } else if (["GASTO", "EGRESO"].includes(tType)) {
        type = "expenses";
      }

      data[type].total += p.amount;
      data[type].count += 1;
      data[type].methods[p.method] = (data[type].methods[p.method] || 0) + p.amount;
    });

    return data;
  }, [summary]);

  useEffect(() => {
    if (isOpen && sessionId) {
      const fetchDetails = async () => {
        setLoading(true);
        setError(null);
        const result = await getSessionSummary(sessionId);
        if (result.success && result.data) {
          setSummary(result.data);
        } else {
          setError(result.error || "Error al cargar los detalles");
        }
        setLoading(false);
      };

      fetchDetails();
    } else {
      setSummary(null);
    }
  }, [isOpen, sessionId]);

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "EFECTIVO":
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case "TARJETA_CREDITO":
        return <CreditCard className="h-4 w-4 text-blue-600" />;
      case "TRANSFERENCIA":
        return <ArrowRightLeft className="h-4 w-4 text-purple-600" />;
      case "MERCADOPAGO":
        return <Wallet className="h-4 w-4 text-sky-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionDescription = (payment: any) => {
    if (payment.reserve) {
      const courtName = payment.reserve.court?.name || "Cancha";
      const time = payment.reserve.schedule;
      return `Reserva: ${courtName} - ${time}hs`;
    }
    if (payment.sale) {
      const products = payment.sale.productSales
        ?.map((ps: any) => `${ps.quantity}x ${ps.product.name}`)
        .join(", ");
      return `Venta: ${products || "Productos varios"}`;
    }
    if (payment.transactionType === "GASTO" || payment.transactionType === "EGRESO") {
      return `Gasto/Egreso: ${payment.observations || "Sin descripción"}`;
    }
    return "Movimiento de caja";
  };

  const renderStatCard = (
    title: string,
    data: {
      total: number;
      methods: Record<string, number>;
      count: number;
      byCourtName?: Record<
        string,
        { total: number; methods: Record<string, number>; count: number }
      >;
      byProduct?: Record<string, { total: number; methods: Record<string, number>; count: number }>;
    },
    colorClass: string
  ) => {
    if (data.count === 0) return null;

    return (
      <Card className="overflow-hidden border shadow-sm">
        <div
          className={`p-3 border-b font-semibold text-sm ${colorClass} bg-opacity-10 flex justify-between items-center`}
        >
          <span>{title}</span>
          <Badge variant="outline" className="bg-white/50 border-0">
            {data.count}
          </Badge>
        </div>
        <CardContent className="p-4 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="font-bold text-lg">${data.total.toLocaleString("es-AR")}</span>
          </div>
          <Separator />
          <div className="space-y-2 pt-1">
            <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
              Métodos de Pago Globales
            </div>
            {Object.entries(data.methods).map(([method, amount]) => (
              <div key={method} className="flex justify-between text-sm items-center">
                <span className="capitalize flex items-center gap-2 text-muted-foreground">
                  {getPaymentMethodIcon(method)}
                  {method.toLowerCase().replace("_", " ")}
                </span>
                <span className="font-medium">${amount.toLocaleString("es-AR")}</span>
              </div>
            ))}
          </div>

          {/* Desglose por Cancha */}
          {data.byCourtName && Object.keys(data.byCourtName).length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  Desglose por Cancha
                </div>
                {Object.entries(data.byCourtName).map(([courtName, courtData]) => (
                  <div key={courtName} className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{courtName}</span>
                      <span className="font-bold text-sm">
                        ${courtData.total.toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div className="space-y-1 pl-2">
                      {Object.entries(courtData.methods).map(([method, amount]) => (
                        <div key={method} className="flex justify-between text-xs items-center">
                          <span className="capitalize flex items-center gap-1.5 text-muted-foreground">
                            {getPaymentMethodIcon(method)}
                            {method.toLowerCase().replace("_", " ")}
                          </span>
                          <span className="font-medium">${amount.toLocaleString("es-AR")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Desglose por Producto */}
          {data.byProduct && Object.keys(data.byProduct).length > 0 && (
            <>
              <Separator className="my-3" />
              <div className="space-y-3">
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  Desglose por Producto
                </div>
                {Object.entries(data.byProduct).map(([productName, productData]) => (
                  <div key={productName} className="bg-muted/30 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-sm">{productName}</span>
                      <span className="font-bold text-sm">
                        ${productData.total.toLocaleString("es-AR")}
                      </span>
                    </div>
                    <div className="space-y-1 pl-2">
                      {Object.entries(productData.methods).map(([method, amount]) => (
                        <div key={method} className="flex justify-between text-xs items-center">
                          <span className="capitalize flex items-center gap-1.5 text-muted-foreground">
                            {getPaymentMethodIcon(method)}
                            {method.toLowerCase().replace("_", " ")}
                          </span>
                          <span className="font-medium">${amount.toLocaleString("es-AR")}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <DialogTitle>Detalle de Sesión de Caja</DialogTitle>
          <DialogDescription>
            {summary && (
              <span>
                {format(new Date(summary.startAt), "EEEE d 'de' MMMM, HH:mm", { locale: es })} -{" "}
                {summary.user?.name}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="p-6">
            <div className="flex items-center gap-2 text-red-500 p-4 bg-red-50 rounded-lg">
              <AlertCircle className="h-5 w-5" />
              <p>{error}</p>
            </div>
          </div>
        ) : summary ? (
          <div className="flex-1 min-h-0 overflow-hidden">
            <Tabs defaultValue="summary" className="h-full flex flex-col">
              <div className="px-6 pt-2 shrink-0">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="summary">Resumen y Desglose</TabsTrigger>
                  <TabsTrigger value="movements">Todos los Movimientos</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent
                value="summary"
                className="flex-1 min-h-0 overflow-hidden mt-0 data-[state=active]:flex data-[state=active]:flex-col"
              >
                <ScrollArea className="flex-1">
                  <div className="p-6 pt-4 pb-8 space-y-6">
                    {/* Resumen de Totales Globales */}
                    <div>
                      <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                        Totales por Método de Pago
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Card className="bg-green-50 border-green-100 dark:bg-green-900/20 dark:border-green-900">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-muted-foreground uppercase font-bold mb-1">
                              Efectivo
                            </span>
                            <span className="text-xl font-bold text-green-700 dark:text-green-400">
                              ${summary.totals.CASH.toLocaleString("es-AR")}
                            </span>
                          </CardContent>
                        </Card>
                        <Card className="bg-blue-50 border-blue-100 dark:bg-blue-900/20 dark:border-blue-900">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-muted-foreground uppercase font-bold mb-1">
                              Tarjeta
                            </span>
                            <span className="text-xl font-bold text-blue-700 dark:text-blue-400">
                              ${summary.totals.CARD.toLocaleString("es-AR")}
                            </span>
                          </CardContent>
                        </Card>
                        <Card className="bg-purple-50 border-purple-100 dark:bg-purple-900/20 dark:border-purple-900">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-muted-foreground uppercase font-bold mb-1">
                              Transferencia
                            </span>
                            <span className="text-xl font-bold text-purple-700 dark:text-purple-400">
                              ${summary.totals.TRANSFER.toLocaleString("es-AR")}
                            </span>
                          </CardContent>
                        </Card>
                        <Card className="bg-sky-50 border-sky-100 dark:bg-sky-900/20 dark:border-sky-900">
                          <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                            <span className="text-xs text-muted-foreground uppercase font-bold mb-1">
                              Mercado Pago
                            </span>
                            <span className="text-xl font-bold text-sky-700 dark:text-sky-400">
                              ${summary.totals.MERCADOPAGO.toLocaleString("es-AR")}
                            </span>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Desglose por Categoría */}
                    {stats && (
                      <div>
                        <h3 className="font-semibold mb-3 text-sm text-muted-foreground uppercase tracking-wider">
                          Desglose por Operación
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {renderStatCard(
                            "Reservas de Canchas",
                            stats.reservations,
                            "bg-blue-100 text-blue-700"
                          )}
                          {renderStatCard(
                            "Venta de Productos",
                            stats.sales,
                            "bg-orange-100 text-orange-700"
                          )}
                          {renderStatCard(
                            "Gastos y Egresos",
                            stats.expenses,
                            "bg-red-100 text-red-700"
                          )}
                          {renderStatCard(
                            "Otros Movimientos",
                            stats.others,
                            "bg-gray-100 text-gray-700"
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value="movements"
                className="flex-1 min-h-0 mt-0 data-[state=active]:flex data-[state=active]:flex-col p-6 pt-0 overflow-hidden"
              >
                <div className="flex-1 min-h-0 border rounded-md flex flex-col mt-4">
                  <div className="bg-muted/50 p-2 border-b shrink-0">
                    <h3 className="font-semibold text-sm">Movimientos Registrados</h3>
                  </div>
                  <ScrollArea className="flex-1">
                    <div className="pb-4">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Hora</TableHead>
                            <TableHead>Descripción</TableHead>
                            <TableHead>Método</TableHead>
                            <TableHead className="text-right">Monto</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {summary.payments?.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={4}
                                className="text-center py-8 text-muted-foreground"
                              >
                                No hay movimientos registrados
                              </TableCell>
                            </TableRow>
                          ) : (
                            summary.payments?.map((payment: any) => (
                              <TableRow key={payment.id}>
                                <TableCell className="font-medium">
                                  {format(new Date(payment.createdAt), "HH:mm", { locale: es })}
                                </TableCell>
                                <TableCell>{getTransactionDescription(payment)}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    {getPaymentMethodIcon(payment.method)}
                                    <span className="text-xs capitalize">
                                      {payment.method.toLowerCase().replace("_", " ")}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-mono">
                                  ${payment.amount.toLocaleString("es-AR")}
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        ) : null}

        {/* Footer con Totales Finales */}
        {summary && (
          <div className="flex justify-between items-center bg-muted/30 p-4 rounded-lg border-t shrink-0">
            <div className="text-sm text-muted-foreground">
              {summary.observations && (
                <p>
                  <span className="font-semibold">Observaciones:</span> {summary.observations}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="flex justify-between w-48 text-sm">
                <span>Monto Inicial:</span>
                <span>${summary.initialAmount.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between w-48 text-sm font-bold">
                <span>Total Recaudado:</span>
                <span>
                  $
                  {(
                    summary.totals.CASH +
                    summary.totals.CARD +
                    summary.totals.TRANSFER +
                    summary.totals.MERCADOPAGO +
                    summary.totals.OTHER
                  ).toLocaleString("es-AR")}
                </span>
              </div>
              {summary.finalAmount !== null && (
                <div className="flex justify-between w-48 text-sm pt-2 border-t mt-1">
                  <span>Cierre de Caja:</span>
                  <span className="font-bold">${summary.finalAmount?.toLocaleString("es-AR")}</span>
                </div>
              )}
              {summary.difference !== undefined && summary.difference !== null && (
                <div
                  className={`flex justify-between w-48 text-sm font-bold ${
                    summary.difference < 0
                      ? "text-red-500"
                      : summary.difference > 0
                        ? "text-green-500"
                        : ""
                  }`}
                >
                  <span>Diferencia:</span>
                  <span>
                    {summary.difference > 0 ? "+" : ""}${summary.difference.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
