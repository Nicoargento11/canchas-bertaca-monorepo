// import { SideBarProvider } from "@/contexts/sideBarContext";
import { getSession } from "@/services/auth/session";
import React from "react";
import { ReservationDashboardProvider } from "@/contexts/ReserveDashboardContext";
import { SidebarProvider } from "@/components/ui/sidebar";
import SideBar from "../../_components/sidebar/sidebar";
// import { SideBarProvider } from "@/contexts/sideBarContext";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSession();

  return (
    <div className="min-h-screen">
      <ReservationDashboardProvider>
        <SidebarProvider>
          <SideBar currentUser={sessionUser} />
          <main className="flex-1 sm:p-6 overflow-auto bg-gray-50">
            <div className="mx-auto">{children}</div>
          </main>
        </SidebarProvider>
      </ReservationDashboardProvider>
    </div>
  );
}
