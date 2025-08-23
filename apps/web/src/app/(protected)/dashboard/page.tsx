import React from "react";
import BiTableDay from "../_components/dashboard/dashboard/biTableDay";
import { getSession } from "@/services/auth/session";
import ReserveModal from "../_components/dashboard/dashboard/reserveModal";
import ReserveDetailsModal from "../_components/dashboard/dashboard/reserveDetailsModal";
import EditReserveModal from "../_components/dashboard/dashboard/editReserveModal";
import { getComplexBySlug } from "@/services/complex/complex";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import DashboardPage from "../_components/dashboard/dashboard/dashboardPage";
import { formatSportTypeName } from "@/services/sport-types/sport-types";
import { DashboardHeader } from "./DashboardHeader";
import CompletedReserveDetailsModal from "../_components/dashboard/dashboard/completedReserveDetailsModal";
import CompleteReserveModal from "../_components/dashboard/dashboard/completeReserveModal";

const PageDashboard = async ({ params }: { params: Promise<{ slug: string }> }) => {
  const { success, data: complejo } = await getComplexBySlug("bertaca");

  if (!complejo) {
    return notFound();
  }

  const sessionUser = await getSession();
  if (!complejo) {
    return;
  }

  return (
    <SidebarInset className="bg-background">
      <DashboardHeader title="Gestión de Reservas" />

      <div className="mt-6">
        <Tabs defaultValue={complejo.sportTypes[0]?.name} className="w-full">
          <TabsList className="w-full h-14 rounded-none rounded-t-lg bg-gray-50">
            {complejo.sportTypes.map((sport) => (
              <TabsTrigger
                key={sport.id}
                value={sport.name}
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
              >
                <span className="capitalize">{formatSportTypeName(sport.name)}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {complejo.sportTypes.map((sport) => (
            <TabsContent
              key={sport.id}
              value={sport.name}
              className="mt-4 rounded-lg bg-card shadow-sm"
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
