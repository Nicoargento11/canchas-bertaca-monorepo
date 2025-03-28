import SideBar from "@/components/sidebar/sidebar";
import { SideBarProvider } from "@/contexts/sideBarContext";
import { getSession } from "@/services/auth/session";
import React from "react";

export default async function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await getSession();

  return (
    <div className="flex">
      {/* <DashboardModalProvider> */}
      <SideBarProvider>
        <SideBar currentUser={sessionUser} />
        {children}
      </SideBarProvider>
      {/* </DashboardModalProvider> */}
    </div>
  );
}
