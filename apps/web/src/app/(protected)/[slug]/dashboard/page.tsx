import React from "react";
import BiTableDay from "../../_components/dashboard/dashboard/biTableDay";
import { getSession } from "@/services/auth/session";
import ReserveModal from "../../_components/dashboard/dashboard/reserveModal";
import ReserveDetailsModal from "../../_components/dashboard/dashboard/reserveDetailsModal";
import EditReserveModal from "../../_components/dashboard/dashboard/editReserveModal";
import { getComplexBySlug } from "@/services/complex/complex";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarInset } from "@/components/ui/sidebar";
import { formatSportTypeName } from "@/services/sport-types/sport-types";
import { DashboardHeader } from "./DashboardHeader";
import CompletedReserveDetailsModal from "../../_components/dashboard/dashboard/completedReserveDetailsModal";
import CompleteReserveModal from "../../_components/dashboard/dashboard/completeReserveModal";
import { ComplexSelector } from "./ComplexSelector";
import { getAvailableComplexes } from "@/lib/getAvailableComplexes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Trophy, Clock, Info, CalendarRange, Calendar } from "lucide-react";
import { FijosGridView } from "../../_components/FijosGridView";

const PageDashboard = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const sessionUser = await getSession();
  const { slug } = await params;

  if (!sessionUser) {
    return notFound();
  }

  // Obtener el complejo por el slug de la URL
  const { success, data: complejo } = await getComplexBySlug(slug);

  if (!complejo) {
    return notFound();
  }
  // Validar que el usuario tenga acceso a este complejo según su rol
  if (sessionUser.user.role === "RECEPCION" || sessionUser.user.role === "COMPLEJO_ADMIN") {
    // Solo puede ver su complejo asignado
    if (sessionUser.user.complexId && complejo.id !== sessionUser.user.complexId) {
      return notFound();
    }
  } else if (sessionUser.user.role === "ORGANIZACION_ADMIN") {
    // Puede ver complejos de su organización (necesitamos validar organizationId)
    // Por ahora permitimos, pero se podría agregar validación adicional aquí
  }
  // SUPER_ADMIN puede ver cualquier complejo

  // Obtener complejos disponibles para el selector
  const availableComplexes = await getAvailableComplexes(sessionUser);

  return (
    <SidebarInset className="bg-gray-50/50 min-h-screen">
      <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <DashboardHeader title="Panel de Control">
            <ComplexSelector
              currentComplex={{ id: complejo.id, name: complejo.name, slug: complejo.slug }}
              availableComplexes={availableComplexes.map((c) => ({
                id: c.id,
                name: c.name,
                slug: c.slug,
              }))}
              userRole={sessionUser.user.role}
            />
          </DashboardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1.5 bg-white text-sm font-normal shadow-sm">
              <CalendarDays className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
              {new Date().toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </Badge>
          </div>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="shadow-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Complejo Activo
              </CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold truncate">{complejo.name}</div>
              <p className="text-xs text-muted-foreground truncate">
                {complejo.address || "Dirección no configurada"}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Deportes Habilitados
              </CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{complejo.sportTypes?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Categorías disponibles para reserva</p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Estado del Sistema
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600 flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
                Operativo
              </div>
              <p className="text-xs text-muted-foreground">Calendario actualizado en tiempo real</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="space-y-4">
          <Tabs defaultValue="reservas" className="w-full space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <TabsList className="h-auto p-1 bg-gray-100/80 rounded-lg">
                <TabsTrigger
                  value="reservas"
                  className="px-6 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200/50"
                >
                  <Calendar className="w-4 h-4" />
                  Reservas
                </TabsTrigger>
                <TabsTrigger
                  value="fijos"
                  className="px-6 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200/50"
                >
                  <CalendarRange className="w-4 h-4" />
                  Fijos
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="reservas" className="mt-0 space-y-6">
              {complejo.sportTypes && complejo.sportTypes.length > 0 ? (
                <Tabs defaultValue={complejo.sportTypes[0]?.name} className="w-full space-y-6">
                  <div className="flex items-center justify-between border-b pb-4">
                    <TabsList className="h-auto p-1 bg-gray-100/80 rounded-lg">
                      {complejo.sportTypes.map((sport) => (
                        <TabsTrigger
                          key={sport.id}
                          value={sport.name}
                          className="px-6 py-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200/50"
                        >
                          <span className="capitalize">{formatSportTypeName(sport.name)}</span>
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {complejo.sportTypes.map((sport) => (
                    <TabsContent
                      key={sport.id}
                      value={sport.name}
                      className="mt-0 focus-visible:outline-none"
                    >
                      <Card className="border-border/60 shadow-sm overflow-hidden">
                        <CardContent className="p-0">
                          <BiTableDay
                            complex={complejo}
                            userEmail={sessionUser?.user.email}
                            userId={sessionUser?.user.id}
                            schedules={complejo.schedules}
                            sportType={sport}
                          />
                        </CardContent>
                      </Card>
                    </TabsContent>
                  ))}
                </Tabs>
              ) : (
                <div className="bg-white rounded-xl border border-dashed p-12 text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="mx-auto h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center">
                      <Info className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Complejo sin configurar</h3>
                    <p className="text-gray-500">
                      Este complejo aún no tiene tipos de deporte, canchas ni horarios configurados.
                    </p>
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-left text-sm">
                      <p className="text-blue-800 font-medium mb-2">Pasos para comenzar:</p>
                      <ol className="text-blue-700 space-y-1 list-decimal list-inside">
                        <li>Crear tipos de deporte</li>
                        <li>Agregar canchas</li>
                        <li>Configurar horarios y tarifas</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="fijos" className="mt-0">
              <Card className="border-border/60 shadow-sm overflow-hidden">
                <CardContent className="p-0">
                  <FijosGridView complex={complejo} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Modales */}
        <ReserveModal />
        <ReserveDetailsModal userSession={sessionUser} />
        <EditReserveModal />
        <CompleteReserveModal />
        <CompletedReserveDetailsModal />
      </div>
    </SidebarInset>
  );
};

export default PageDashboard;
