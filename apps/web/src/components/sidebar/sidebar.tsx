"use client";
import React, { useState } from "react";
import { SidebarMenu } from "@/components/sidebar/sidebar-menu";
import { SideBarItem } from "@/components/sidebar/sidebar-item";

import {
  LayoutDashboard,
  BarChart4,
  CreditCard,
  ClipboardPen,
  Notebook,
  Settings,
} from "lucide-react";
// import { Userdb } from "@/types/db";
import { usePathname, useRouter } from "next/navigation";
import { useSideBarContext } from "@/contexts/sideBarContext";
import { Session } from "@/services/auth/session";

interface SideBarProps {
  currentUser: Session | null | undefined;
}

interface PathToIndex {
  [key: string]: number;
}
// Map of paths to active index
const pathToIndex: PathToIndex = {
  "/dashboard": 0,
  "/dashboard/reserves": 1,
  "/dashboard/payments": 2,
  "/dashboard/stock": 3,
  "/dashboard/settings": 4,
  "/dashboard/statistics": 5,
};
const SideBar = ({ currentUser }: SideBarProps) => {
  const { setExpanded } = useSideBarContext();
  const pathname = usePathname(); // Hook to get the current pathname
  const router = useRouter();
  const [active, setActive] = useState<number>(pathToIndex[pathname] ?? 0);

  const handleClick = (index: number, url: string) => {
    setActive(index);
    router.push(url);
    setExpanded((value) => (value ? !value : value));
  };
  return (
    <SidebarMenu user={currentUser}>
      <SideBarItem
        icon={<LayoutDashboard size={25} />}
        text="Panel"
        active={active == 0}
        onClick={() => handleClick(0, "/dashboard")}
      />
      <SideBarItem
        icon={<Notebook size={25} />}
        active={active == 1}
        text="Lista de reservas"
        onClick={() => handleClick(1, "/dashboard/reserves")}
      />
      <SideBarItem
        icon={<Settings size={25} />}
        active={active == 4}
        text="Configuracion"
        onClick={() => handleClick(4, "/dashboard/settings")}
      />
      <SideBarItem
        icon={<CreditCard size={25} />}
        active={active == 2}
        text="Historial de pagos"
        onClick={() => handleClick(2, "/dashboard/payments")}
      />
      <SideBarItem
        icon={<ClipboardPen size={25} />}
        active={active == 3}
        text="Stock"
        isDisabled={true}
        onClick={() => handleClick(3, "/dashboard/stock")}
      />
      <SideBarItem
        icon={<BarChart4 size={25} />}
        active={active == 5}
        text="Estadisticas"
        isDisabled={true}
        onClick={() => handleClick(5, "/dashboard/statistics")}
      />
    </SidebarMenu>
  );
};

export default SideBar;
