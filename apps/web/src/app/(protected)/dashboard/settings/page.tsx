import React from "react";
import ScheduleForm from "./createSchedule";
import RateForm from "./createRate";
import { getScheduleDays } from "@/services/scheduleDay/scheduleDay";
import AvailableDaysForm from "./availableDaysForm";
import { getRates } from "@/services/rate/rate";
import { getSchedules } from "@/services/schedule/schedule";
import EditSchedules from "./editSchedules";
import EditRates from "./editRates";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DisabledDays from "./disabledDays";
import { getUnavailableDays } from "@/services/unavailableDay/unavailableDay";
import EditUnavailableDays from "./editUnavailableDays";
import FixedScheduleForm from "./fixedScheduleForm";
import { getCourtByName } from "@/services/courts/courts";
import { getUsers } from "@/services/users/users";
import EditFixedSchedules from "./editFixedSchedules";
import { getfixedSchedules } from "@/services/fixed-schedules/fixedSchedules";
import { CalendarDays, Clock, DollarSign, Lock, Repeat } from "lucide-react";

const Page = async () => {
  const scheduleDays = await getScheduleDays();
  const rates = await getRates();
  const schedules = await getSchedules();
  const disabledDays = await getUnavailableDays();
  const court = await getCourtByName("dimasf5");
  const users = await getUsers();
  const fixedSchedules = await getfixedSchedules();

  return (
    <div className="w-full p-8 bg-gradient-to-br from-sky-50 to-blue-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        {/* Tabs para Configuración y Visualización */}
        <Tabs defaultValue="Dias/Semana" className="space-y-6">
          {/* Lista de Tabs */}
          <TabsList className="flex justify-between w-full bg-white shadow-sm">
            <TabsTrigger
              value="Dias/Semana"
              className="w-full gap-1 data-[state=active]:bg-Primary data-[state=active]:text-white"
            >
              <CalendarDays size={20} />
              Dias/semana
            </TabsTrigger>
            <TabsTrigger
              value="Horarios"
              className="w-full gap-1 data-[state=active]:bg-Complementary data-[state=active]:text-white"
            >
              <Clock size={20} />
              Horarios
            </TabsTrigger>
            <TabsTrigger
              value="Tarifas"
              className="w-full gap-1 data-[state=active]:bg-Primary data-[state=active]:text-white"
            >
              <DollarSign size={20} />
              Tarifas
            </TabsTrigger>

            <TabsTrigger
              value="Desabilitar dias"
              className="w-full gap-1 data-[state=active]:bg-Complementary data-[state=active]:text-white"
            >
              <Lock size={20} />
              Desabilitar dias
            </TabsTrigger>
            <TabsTrigger
              value="Turnos fijos"
              className="w-full gap-1 data-[state=active]:bg-Primary data-[state=active]:text-white"
            >
              <Repeat size={20} />
              Turnos fijos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Dias/Semana" className=" space-y-8">
            {/* Formulario de Disponibilidad de Días */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <AvailableDaysForm initialData={scheduleDays} />
            </div>
          </TabsContent>

          <TabsContent value="Horarios" className="space-y-8">
            {/* Formulario de Horarios */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <ScheduleForm rates={rates} />
            </div>
            {/* Sección: Ver y Editar Horarios */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-Primary-dark mb-4">
                Horarios Creados
              </h2>
              <EditSchedules schedules={schedules} rates={rates} />
            </div>
          </TabsContent>

          <TabsContent value="Tarifas" className="space-y-8">
            {/* Formulario de Tarifas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <RateForm />
            </div>
            {/* Sección: Ver y Editar Tarifas */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-Primary-dark mb-4">
                Tarifas Creadas
              </h2>
              <EditRates rates={rates} />
            </div>
          </TabsContent>

          <TabsContent value="Desabilitar dias" className="space-y-8">
            {/* Desabilitar dias */}
            <div className="p-8 bg-gradient-to-br from-sky-50 to-blue-50 min-h-screen">
              <DisabledDays initialData={disabledDays} />
            </div>
            {/* Sección: Ver y Editar Dias deshabilitados */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-Primary-dark mb-4">
                Dias no disponibles
              </h2>
              <EditUnavailableDays initialData={disabledDays} />
            </div>
          </TabsContent>

          {/* Contenido de la pestaña de Visualización */}
          <TabsContent value="Turnos fijos" className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <FixedScheduleForm
                court={court}
                rates={rates}
                usersData={users}
              />
            </div>
            <div className="bg-white rounded-xl shadow-lg p-6">
              <EditFixedSchedules
                fixedSchedules={fixedSchedules}
                rates={rates}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Page;
