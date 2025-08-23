import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProductForm } from "../../_components/stock/AddProductForm";
import { getComplexBySlug } from "@/services/complex/complex";
import { notFound } from "next/navigation";
import { InventoryTable } from "../../_components/stock/InventoryTable";
import { SaleSystem } from "../../_components/stock/SalesSystem";
import { SalesHistory } from "../../_components/stock/SalesHistory";
import { SalesReport } from "../../_components/stock/SalesReport";
import { ProfitMargin } from "../../_components/stock/ProfitMargin";
import { InventorySummary } from "../../_components/stock/InventorySummary";
import { getSession } from "@/services/auth/session";
import { DashboardHeader } from "../DashboardHeader";
import { getAllCashRegisters } from "@/services/cash-register/cash-register";
import {
  getActiveCashSession,
  getActiveCashSessionByUser,
} from "@/services/cash-session/cash-session";
import { formatReportDate, getDailySummary } from "@/services/reports/reports";

export default async function Home({ params }: { params: Promise<{ slug: string }> }) {
  // const { slug } = await params;
  const { data: complejo } = await getComplexBySlug("bertaca");
  const userSession = await getSession();

  if (!complejo) {
    return notFound();
  }

  const cashRegisters = await getAllCashRegisters(complejo.id);

  if (!userSession) {
    return notFound();
  }
  const activeCashSession = await getActiveCashSessionByUser(userSession?.user.id);
  console.log(activeCashSession);
  const today = formatReportDate(new Date());
  // const {
  //   data: dailySummaryData,
  //   error,
  //   success,
  // } = await getDailySummary(today, complejo.id, activeCashSession.data?.id || "");
  // console.log(dailySummaryData);
  // if (error || !success) {
  //   console.error("Error fetching daily summary:", error);
  // }
  const mostrarInventario = userSession?.user.role === "COMPLEJO_ADMIN";
  const mostrarVentas =
    userSession?.user.role === "COMPLEJO_ADMIN" || userSession?.user.role === "RECEPCION";
  const mostrarReportes = userSession?.user.role === "COMPLEJO_ADMIN";
  const mostrarUsuarios = true;
  return (
    <div className="flex min-h-screen w-full flex-col">
      <DashboardHeader title="Sistema de Inventario y Ventas" subtitle="Complejo Deportivo" />

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs
          defaultValue={mostrarVentas ? "ventas" : mostrarReportes ? "reportes" : "resumen"}
          className="space-y-4"
        >
          <TabsList
            className="flex w-full overflow-x-auto pb-2 gap-1 min-h-14"
            style={{ gridTemplateColumns: `repeat(${mostrarUsuarios ? 7 : 6}, 1fr)` }}
          >
            {mostrarVentas && <TabsTrigger value="ventas">Ventas</TabsTrigger>}
            {mostrarInventario && <TabsTrigger value="inventario">Inventario</TabsTrigger>}
            {mostrarInventario && <TabsTrigger value="agregar">Agregar</TabsTrigger>}
            {mostrarReportes && <TabsTrigger value="historial">Historial</TabsTrigger>}
            {mostrarReportes && <TabsTrigger value="reportes">Reportes</TabsTrigger>}
            {mostrarReportes && <TabsTrigger value="margen">Margen</TabsTrigger>}
            <TabsTrigger value="resumen">Resumen</TabsTrigger>
          </TabsList>

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
                  <InventoryTable complex={complejo} />
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
          {mostrarReportes && (
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
          {mostrarReportes && (
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
          <TabsContent value="resumen" className="space-y-4">
            <InventorySummary complex={complejo} />
          </TabsContent>
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
