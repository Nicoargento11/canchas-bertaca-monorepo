import React from "react";
import ScheduleForm from "./schedules/createSchedule";
import RateForm from "./rates/createRate";
import AvailableDaysForm from "./available-days/availableDaysForm";
import EditSchedules from "./schedules/editSchedules";
import EditRates from "./rates/editRates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DisabledDays from "./disabled-days/disabledDays";
import EditUnavailableDays from "./disabled-days/editUnavailableDays";
import FixedScheduleForm from "./fixed-reserves/fixedReserveForm";
import { getUsers } from "@/services/user/user";
import EditFixedSchedules from "./fixed-reserves/editFixedReserves";
import { Activity, CalendarDays, Clock, DollarSign, Lock, Repeat } from "lucide-react";
import { soccerPitch } from "@lucide/lab";
import { Icon } from "lucide-react";
import { getComplexBySlug } from "@/services/complex/complex";
import { notFound } from "next/navigation";
import { getSession } from "@/services/auth/session";

import { CanchaSection } from "./courts/canchaSection";
import { SportTypeSection } from "./sport-types/sportTypeSection";
import { DashboardHeader } from "../DashboardHeader";

const Page = async ({ params }: { params: Promise<{ slug: string }> }) => {
  // const { slug } = await params;
  const { data: complejo } = await getComplexBySlug("bertaca");
  const { success, error, data: users } = await getUsers();
  const sessionUser = await getSession();

  if (!complejo) {
    return notFound();
  }
  if (!complejo) {
    return;
  }

  return (
    <div className="w-full p-4 md:p-8 bg-gradient-to-br from-sky-50 to-blue-50 min-h-screen">
      <DashboardHeader title="Configuracion" />

      <div className="mt-6 mx-auto">
        {/* Tabs para Configuración y Visualización */}
        <Tabs defaultValue="Tipos Deporte" className="space-y-4 ">
          {/* Lista de Tabs - Versión responsive */}
          <TabsList className="flex w-full overflow-x-auto pb-2 gap-1 min-h-14">
            <TabsTrigger value="Tipos Deporte">
              <Activity className="h-4 w-4 md:h-5 md:w-5" />
              <span> Deportes</span>
            </TabsTrigger>
            <TabsTrigger value="Canchas">
              <Icon iconNode={soccerPitch} className="h-4 w-4 md:h-5 md:w-5" />
              <span> Canchas</span>
            </TabsTrigger>
            <TabsTrigger value="Dias/Semana">
              <CalendarDays className="h-4 w-4 md:h-5 md:w-5" />
              <span> Dias</span>
            </TabsTrigger>
            <TabsTrigger value="Horarios">
              <Clock className="h-4 w-4 md:h-5 md:w-5" />
              <span> Horas</span>
            </TabsTrigger>
            <TabsTrigger value="Tarifas">
              <DollarSign className="h-4 w-4 md:h-5 md:w-5" />
              <span> Tarifas</span>
            </TabsTrigger>
            <TabsTrigger value="Desabilitar dias">
              <Lock className="h-4 w-4 md:h-5 md:w-5" />
              No disp.
            </TabsTrigger>
            <TabsTrigger value="Turnos fijos">
              <Repeat className="h-4 w-4 md:h-5 md:w-5" />
              <span> Fijos</span>
            </TabsTrigger>
          </TabsList>

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
              <AvailableDaysForm
                initialData={complejo.scheduleDays}
                complex={complejo}
                sportType={complejo.sportTypes[0]}
              />
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
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <FixedScheduleForm complex={complejo} usersData={users} />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
              <EditFixedSchedules complex={complejo} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
