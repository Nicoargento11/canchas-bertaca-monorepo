import React from "react";
import BiTableDay from "../../_components/dashboard/dashboard/biTableDay";
import { getSession } from "@/services/auth/session";
import ReserveModal from "../../_components/dashboard/dashboard/reserveModal";
import ReserveDetailsModal from "../../_components/dashboard/dashboard/reserveDetailsModal";
import EditReserveModal from "../../_components/dashboard/dashboard/editReserveModal";
import { getComplexBySlug } from "@/services/complex/complex";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { formatSportTypeName } from "@/services/sport-types/sport-types";
import CompletedReserveDetailsModal from "../../_components/dashboard/dashboard/completedReserveDetailsModal";
import CompleteReserveModal from "../../_components/dashboard/dashboard/completeReserveModal";
import { ComplexSelector } from "./ComplexSelector";
import { getAvailableComplexes } from "@/lib/getAvailableComplexes";
import { Card, CardContent } from "@/components/ui/card";
import { Info } from "lucide-react";
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
    <SidebarInset className="bg-gray-50 min-h-screen">
      <div className="max-w-[1600px] mx-auto">
        {/* Header unificado - una sola línea */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="px-4 md:px-6 py-3 flex items-center justify-between">
            {/* Izquierda: Sidebar trigger + Complejo + Selector */}
            <div className="flex items-center gap-2">
              <SidebarTrigger className="text-gray-700 hover:bg-gray-100" />
              <ComplexSelector
                currentComplex={{ id: complejo.id, name: complejo.name, slug: complejo.slug }}
                availableComplexes={availableComplexes.map((c) => ({
                  id: c.id,
                  name: c.name,
                  slug: c.slug,
                }))}
                userRole={sessionUser.user.role}
              />
            </div>

            {/* Derecha: Fecha */}
            <span className="hidden sm:block text-sm text-gray-500">
              {new Date().toLocaleDateString("es-AR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="p-4 md:p-6">
          <Tabs defaultValue="reservas" className="w-full">
            {/* Navigation tabs con mejor contraste */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <TabsList className="h-10 p-1 bg-gray-200 rounded-lg">
                <TabsTrigger
                  value="reservas"
                  className="h-8 px-4 text-sm font-medium rounded-md text-gray-600 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Reservas
                </TabsTrigger>
                <TabsTrigger
                  value="fijos"
                  className="h-8 px-4 text-sm font-medium rounded-md text-gray-600 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md"
                >
                  Fijos
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="reservas" className="mt-0">
              {complejo.sportTypes && complejo.sportTypes.length > 0 ? (
                <Tabs defaultValue={complejo.sportTypes[0]?.name} className="w-full">
                  {/* Solo mostrar tabs de deportes si hay más de 1 */}
                  {complejo.sportTypes.length > 1 && (
                    <TabsList className="h-10 p-1 bg-gray-200 rounded-lg mb-4">
                      {complejo.sportTypes.map((sport) => (
                        <TabsTrigger
                          key={sport.id}
                          value={sport.name}
                          className="h-8 px-4 text-sm font-medium rounded-md text-gray-600 data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md"
                        >
                          {formatSportTypeName(sport.name)}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  )}

                  {complejo.sportTypes.map((sport) => (
                    <TabsContent
                      key={sport.id}
                      value={sport.name}
                      className="mt-0 focus-visible:outline-none"
                    >
                      <BiTableDay
                        complex={complejo}
                        userEmail={sessionUser?.user.email}
                        userId={sessionUser?.user.id}
                        schedules={complejo.schedules}
                        sportType={sport}
                      />
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
