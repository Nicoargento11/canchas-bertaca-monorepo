import React from "react";
import ScheduleForm from "./schedules/createSchedule";
import RateForm from "./rates/createRate";
import AvailableDaysForm from "./available-days/availableDaysForm";
import EditSchedules from "./schedules/editSchedules";
import EditRates from "./rates/editRates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DisabledDays from "./disabled-days/disabledDays";
import EditUnavailableDays from "./disabled-days/editUnavailableDays";
import FixedReservesClient from "./fixed-reserves/FixedReservesClient";
import { Activity, CalendarDays, Clock, DollarSign, Lock, Percent, Repeat } from "lucide-react";
import { soccerPitch } from "@lucide/lab";
import { Icon } from "lucide-react";
import { getComplexBySlug } from "@/services/complex/complex";
import { notFound } from "next/navigation";
import { getSession } from "@/services/auth/session";

import { CanchaSection } from "./courts/canchaSection";
import { SportTypeSection } from "./sport-types/sportTypeSection";
import { DashboardHeader } from "../DashboardHeader";
import { PromotionSection } from "./promotions/promotionSection";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { slug } = await params;
  const { data: complejo } = await getComplexBySlug(slug);
  const sessionUser = await getSession();
  if (!complejo) {
    return notFound();
  }

  return (
    <div className="w-full p-4 md:p-8 min-h-screen">
      <DashboardHeader title="Configuracion" />

      <div className="mt-6 mx-auto max-w-7xl">
        {/* Tabs para Configuración y Visualización */}
        <Tabs defaultValue="Tipos Deporte" className="space-y-6">
          {/* Lista de Tabs - Versión responsive mejorada */}
          <div className="flex items-center justify-between border-b pb-4 overflow-x-auto">
            <TabsList className="h-auto p-1 bg-gray-100/80 rounded-lg inline-flex">
              <TabsTrigger
                value="Tipos Deporte"
                className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
              >
                <Activity className="h-4 w-4" />
                <span>Deportes</span>
              </TabsTrigger>
              <TabsTrigger
                value="Canchas"
                className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
              >
                <Icon iconNode={soccerPitch} className="h-4 w-4" />
                <span>Canchas</span>
              </TabsTrigger>
              <TabsTrigger
                value="Dias/Semana"
                className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
              >
                <CalendarDays className="h-4 w-4" />
                <span>Días</span>
              </TabsTrigger>
              <TabsTrigger
                value="Horarios"
                className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
              >
                <Clock className="h-4 w-4" />
                <span>Horas</span>
              </TabsTrigger>
              <TabsTrigger
                value="Tarifas"
                className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
              >
                <DollarSign className="h-4 w-4" />
                <span>Tarifas</span>
              </TabsTrigger>
              <TabsTrigger
                value="Promociones"
                className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
              >
                <Percent className="h-4 w-4" />
                <span>Promos</span>
              </TabsTrigger>
              <TabsTrigger
                value="Desabilitar dias"
                className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
              >
                <Lock className="h-4 w-4" />
                <span>No disp.</span>
              </TabsTrigger>
              <TabsTrigger
                value="Turnos fijos"
                className="px-4 py-2 gap-2 rounded-md text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm hover:bg-gray-200 hover:text-gray-900"
              >
                <Repeat className="h-4 w-4" />
                <span>Fijos</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="Tipos Deporte" className="space-y-4 md:space-y-8">
            <SportTypeSection complex={complejo} />
          </TabsContent>

          <TabsContent value="Canchas" className="space-y-4 md:space-y-8">
            {/* Formulario de Disponibilidad de Días */}

            <CanchaSection
              complex={complejo}
              schedules={complejo.schedules}
              fixedReserves={complejo.fixedReserves}
            />
          </TabsContent>

          <TabsContent value="Dias/Semana" className="space-y-4 md:space-y-8">
            {/* Formulario de Disponibilidad de Días */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              {complejo.sportTypes && complejo.sportTypes.length > 0 ? (
                <AvailableDaysForm
                  initialData={complejo.scheduleDays}
                  complex={complejo}
                  sportType={complejo.sportTypes[0]}
                />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg font-semibold">No hay tipos de deporte configurados</p>
                  <p className="text-sm mt-2">
                    Crea un tipo de deporte primero en la pestaña "Deportes"
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="Horarios" className="space-y-4 md:space-y-8">
            {/* Formulario de Horarios */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <ScheduleForm complex={complejo} />
            </div>
            {/* Sección: Ver y Editar Horarios */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-Primary-dark mb-3 md:mb-4">
                Horarios Creados
              </h2>
              <EditSchedules complex={complejo} />
            </div>
          </TabsContent>

          <TabsContent value="Tarifas" className="space-y-4 md:space-y-8">
            {/* Formulario de Tarifas */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <RateForm complex={complejo} />
            </div>
            {/* Sección: Ver y Editar Tarifas */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-Primary-dark mb-3 md:mb-4">
                Tarifas Creadas
              </h2>
              <EditRates complex={complejo} />
            </div>
          </TabsContent>

          <TabsContent value="Promociones" className="space-y-4 md:space-y-8">
            <PromotionSection complex={complejo} />
          </TabsContent>

          <TabsContent value="Desabilitar dias" className="space-y-4 md:space-y-8">
            {/* Desabilitar dias */}
            <div className="p-4 md:p-8 bg-gradient-to-br from-sky-50 to-blue-50">
              <DisabledDays complex={complejo} />
            </div>
            {/* Sección: Ver y Editar Dias deshabilitados */}
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <h2 className="text-xl md:text-2xl font-bold text-Primary-dark mb-3 md:mb-4">
                Dias no disponibles
              </h2>
              <EditUnavailableDays initialData={complejo.unavailableDays} />
            </div>
          </TabsContent>

          {/* Contenido de la pestaña de Visualización */}
          <TabsContent value="Turnos fijos" className="space-y-4 md:space-y-8">
            <FixedReservesClient complex={complejo} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
