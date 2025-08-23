"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { DollarSign, TrendingUp, Package, Users } from "lucide-react";
import { usePaymentsStore } from "@/store/paymentsStore";
import { Complex } from "@/services/complex/complex";

interface SalesReportProps {
  complex: Complex;
}
export function SalesReport({ complex }: SalesReportProps) {
  const [estadisticas, setEstadisticas] = useState({
    ventasHoy: 0,
    ingresosTotales: 0,
    productosVendidos: 0,
    clientesUnicos: 0,
  });

  // Obtener pagos del store de Zustand
  const { payments, initializePayments } = usePaymentsStore();
  useEffect(() => {
    if (payments.length > 0) {
      // Calcular estadísticas
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0); // Normaliza a medianoche

      const ventasHoy = payments.filter((p) => {
        const fechaPago = new Date(p.createdAt);
        fechaPago.setHours(0, 0, 0, 0);
        return fechaPago.getTime() === hoy.getTime();
      }).length;

      const ingresosTotales = payments.reduce((total, payment) => total + payment.amount, 0);

      const productosVendidos = payments.reduce(
        (total, payment) =>
          total +
          (payment.productSales?.reduce((subtotal, sale) => subtotal + sale.quantity, 0) || 0),
        0
      );

      // Asumiendo que tienes información de cliente en algún lugar
      // Si no, puedes omitir esta métrica o usar otro identificador
      const clientesUnicos = new Set(payments.map((p) => p.reserveId || "anonimo")).size;

      setEstadisticas({
        ventasHoy,
        ingresosTotales,
        productosVendidos,
        clientesUnicos,
      });
    }
  }, [payments, initializePayments]);

  useEffect(() => {
    initializePayments(complex.payments);
  }, [complex.payments]);
  // Datos para gráfico de ventas por día (últimos 7 días)
  const ventasPorDia = useMemo(() => {
    const ultimosSieteDias = [];
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date();
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toDateString();

      const ventasDelDia = payments.filter(
        (p) => new Date(p.createdAt).toDateString() === fechaStr
      );

      const totalDelDia = ventasDelDia.reduce((total, v) => total + v.amount, 0);

      ultimosSieteDias.push({
        fecha: fecha.toLocaleDateString("es-ES", { weekday: "short", day: "numeric" }),
        ventas: ventasDelDia.length,
        ingresos: totalDelDia,
      });
    }
    return ultimosSieteDias;
  }, [payments]);

  // Productos más vendidos
  const productosMasVendidos = useMemo(() => {
    const conteoProductos: Record<string, { nombre: string; cantidad: number; ingresos: number }> =
      {};

    payments.forEach((payment) => {
      payment.productSales?.forEach((sale) => {
        if (conteoProductos[sale.product.id]) {
          conteoProductos[sale.product.id].cantidad += sale.quantity;
          conteoProductos[sale.product.id].ingresos += sale.price * sale.quantity;
        } else {
          conteoProductos[sale.product.id] = {
            nombre: sale.product.name,
            cantidad: sale.quantity,
            ingresos: sale.price * sale.quantity,
          };
        }
      });
    });

    return Object.values(conteoProductos)
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 5);
  }, [payments]);

  // Ventas por método de pago
  const ventasPorMetodoPago = useMemo(() => {
    const metodos: Record<string, number> = {};

    payments.forEach((payment) => {
      metodos[payment.method] = (metodos[payment.method] || 0) + payment.amount;
    });

    return Object.keys(metodos).map((metodo) => ({
      name: metodo.charAt(0).toUpperCase() + metodo.slice(1).toLowerCase(),
      value: metodos[metodo],
    }));
  }, [payments]);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  return (
    <div className="space-y-6">
      {/* Tarjetas de estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.ventasHoy}</div>
            <p className="text-xs text-muted-foreground">Transacciones realizadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${estadisticas.ingresosTotales.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Desde el inicio</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos Vendidos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.productosVendidos}</div>
            <p className="text-xs text-muted-foreground">Unidades totales</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{estadisticas.clientesUnicos}</div>
            <p className="text-xs text-muted-foreground">Clientes diferentes</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {/* Gráfico de Tendencia */}
        <Card>
          <CardHeader>
            <CardTitle>Tendencia de Ventas (7 días)</CardTitle>
            <CardDescription>Evolución diaria de ventas e ingresos</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {ventasPorDia.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ventasPorDia}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="fecha" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "ingresos" ? `$${value}` : value,
                      name === "ingresos" ? "Ingresos" : "Ventas",
                    ]}
                  />
                  <Legend />
                  <Bar yAxisId="left" dataKey="ventas" fill="#8884d8" name="Número de ventas" />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="ingresos"
                    stroke="#82ca9d"
                    name="Ingresos ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No hay datos de ventas recientes
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Productos Top */}
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 productos por cantidad vendida</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {productosMasVendidos.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productosMasVendidos}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nombre" />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [
                      name === "ingresos" ? `$${value}` : value,
                      name === "ingresos" ? "Ingresos" : "Cantidad",
                    ]}
                  />
                  <Legend />
                  <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad vendida" />
                  <Bar dataKey="ingresos" fill="#82ca9d" name="Ingresos ($)" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No hay datos de productos vendidos
              </div>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Métodos de Pago */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Distribución por Método de Pago</CardTitle>
            <CardDescription>Proporción de ingresos por tipo de pago</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            {ventasPorMetodoPago.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ventasPorMetodoPago}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    dataKey="value"
                  >
                    {ventasPorMetodoPago.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`$${value.toFixed(2)}`, "Ingresos"]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                No hay datos de métodos de pago
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
