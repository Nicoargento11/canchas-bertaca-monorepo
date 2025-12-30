import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getComplexBySlug } from "@/services/complex/complex";
import { notFound } from "next/navigation";
import { getSession } from "@/services/auth/session";
import { DashboardHeader } from "../DashboardHeader";
import { getAllCashRegisters } from "@/services/cash-register/cash-register";
import {
  getActiveCashSession,
  getActiveCashSessionByUser,
} from "@/services/cash-session/cash-session";
import { formatReportDate, getDailySummary } from "@/services/reports/reports";
import { SaleSystem } from "@/app/(protected)/_components/stock/SalesSystem";
import { InventoryTable } from "@/app/(protected)/_components/stock/InventoryTable";
import { ProductForm } from "@/app/(protected)/_components/stock/AddProductForm";
import { SalesHistory } from "@/app/(protected)/_components/stock/SalesHistory";
import { SalesReport } from "@/app/(protected)/_components/stock/SalesReport";
import { ProfitMargin } from "@/app/(protected)/_components/stock/ProfitMargin";
import { InventorySummary } from "@/app/(protected)/_components/stock/InventorySummary";
import { PaymentsHistory } from "@/app/(protected)/_components/stock/PaymentsHistory";
import {
  ShoppingCart,
  Package,
  PlusCircle,
  History,
  FileText,
  TrendingUp,
  PieChart,
  CreditCard,
  CalendarDays,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { data: complejo } = await getComplexBySlug(slug);
  const userSession = await getSession();

  if (!complejo) {
    return notFound();
  }

  const cashRegisters = await getAllCashRegisters(complejo.id);

  if (!userSession) {
    return notFound();
  }
  const activeCashSession = await getActiveCashSessionByUser(userSession?.user.id, complejo.id);
  const today = formatReportDate(new Date());

  // Permisos por rol
  const isRecepcion = userSession.user.role === "RECEPCION";

  const mostrarInventario = true;
  const mostrarVentas = true;
  const mostrarHistorial = true; // RECEPCION puede ver historial
  const mostrarPagos = true; // RECEPCION puede ver pagos
  const mostrarReportes = !isRecepcion; // RECEPCION NO puede ver reportes
  const mostrarMargen = !isRecepcion; // RECEPCION NO puede ver margen
  const mostrarResumen = !isRecepcion; // RECEPCION NO puede ver resumen
  const mostrarUsuarios = true;
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader title="Sistema de Inventario y Ventas" subtitle="Complejo Deportivo" />

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs
          defaultValue={mostrarVentas ? "ventas" : mostrarReportes ? "reportes" : "resumen"}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b pb-4 overflow-x-auto">
            <TabsList className="h-auto p-1 bg-gray-100/80 rounded-lg inline-flex">
              {mostrarVentas && (
                <TabsTrigger
                  value="ventas"
                  className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Ventas
                </TabsTrigger>
              )}
              {mostrarInventario && (
                <TabsTrigger
                  value="inventario"
                  className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
                >
                  <Package className="w-4 h-4" />
                  Inventario
                </TabsTrigger>
              )}
              {mostrarInventario && (
                <TabsTrigger
                  value="agregar"
                  className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
                >
                  <PlusCircle className="w-4 h-4" />
                  Agregar
                </TabsTrigger>
              )}
              {mostrarHistorial && (
                <TabsTrigger
                  value="historial"
                  className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
                >
                  <History className="w-4 h-4" />
                  Historial
                </TabsTrigger>
              )}
              {mostrarReportes && (
                <TabsTrigger
                  value="reportes"
                  className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
                >
                  <FileText className="w-4 h-4" />
                  Reportes
                </TabsTrigger>
              )}
              {mostrarPagos && (
                <TabsTrigger
                  value="pagos"
                  className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
                >
                  <CreditCard className="w-4 h-4" />
                  Pagos
                </TabsTrigger>
              )}
              {mostrarMargen && (
                <TabsTrigger
                  value="margen"
                  className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
                >
                  <TrendingUp className="w-4 h-4" />
                  Margen
                </TabsTrigger>
              )}
              {mostrarResumen && (
                <TabsTrigger
                  value="resumen"
                  className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
                >
                  <PieChart className="w-4 h-4" />
                  Resumen
                </TabsTrigger>
              )}
            </TabsList>
            {/* Botón a Reservas */}
            <Link href={`/${slug}/dashboard`}>
              <Button variant="outline" className="border-gray-300 bg-white hover:bg-gray-50">
                <CalendarDays className="mr-2 h-4 w-4 text-blue-600" />
                Reservas
              </Button>
            </Link>
          </div>

          {mostrarVentas && (
            <TabsContent value="ventas" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sistema de Ventas (POS)</CardTitle>
                  <CardDescription>
                    Realiza ventas y actualiza el inventario automáticamente.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SaleSystem
                    complex={complejo}
                    userSession={userSession}
                    activeCashSession={activeCashSession.data || null}
                    cashRegisters={cashRegisters.data || null}
                    // dailySummaryData={dailySummaryData || null}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {mostrarInventario && (
            <TabsContent value="inventario" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Inventario</CardTitle>
                  <CardDescription>
                    Gestiona todos los productos, alimentos y bebidas de tu complejo deportivo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InventoryTable complex={complejo} cashSessionId={activeCashSession.data?.id} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {mostrarInventario && (
            <TabsContent value="agregar" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Agregar Nuevo Producto</CardTitle>
                  <CardDescription>Añade un nuevo producto al inventario.</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductForm complex={complejo} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {mostrarHistorial && (
            <TabsContent value="historial" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Ventas</CardTitle>
                  <CardDescription>Consulta todas las ventas realizadas.</CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesHistory complex={complejo} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {mostrarReportes && (
            <TabsContent value="reportes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Reportes de Ventas</CardTitle>
                  <CardDescription>
                    Analiza el rendimiento de ventas y productos más vendidos.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesReport complex={complejo} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {mostrarPagos && (
            <TabsContent value="pagos" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Historial de Pagos</CardTitle>
                  <CardDescription>
                    Registro completo de todos los pagos recibidos (Reservas y Ventas).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PaymentsHistory complex={complejo} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {mostrarMargen && (
            <TabsContent value="margen" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Margen de Ganancia</CardTitle>
                  <CardDescription>
                    Analiza la rentabilidad por producto y categoría.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ProfitMargin complex={complejo} />
                </CardContent>
              </Card>
            </TabsContent>
          )}
          {mostrarResumen && (
            <TabsContent value="resumen" className="space-y-4">
              <InventorySummary complex={complejo} />
            </TabsContent>
          )}
          {mostrarUsuarios && (
            <TabsContent value="usuarios" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Gestión de Usuarios</CardTitle>
                  <CardDescription>
                    Administra los usuarios del sistema y sus roles.
                  </CardDescription>
                </CardHeader>
                <CardContent>{/* <GestionUsuarios /> */}</CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
}
