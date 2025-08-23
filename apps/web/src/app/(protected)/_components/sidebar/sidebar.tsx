"use client";
import React, { useState } from "react";
import {
  LayoutDashboard,
  BarChart4,
  CreditCard,
  ClipboardPen,
  Notebook,
  Settings,
  Activity,
  Calendar,
  MapPin,
  Users,
  BarChart3,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSideBarContext } from "@/contexts/sideBarContext";
import { SessionPayload } from "@/services/auth/session";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

interface SideBarProps {
  currentUser: SessionPayload | null | undefined;
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

const sidebarItems = [
  {
    title: "Panel",
    icon: LayoutDashboard,
    path: "dashboard",
    index: 0,
  },
  {
    title: "Reservas",
    icon: Calendar,
    path: "reserves",
    index: 1,
  },
  {
    title: "Pagos",
    icon: CreditCard,
    path: "payments",
    index: 2,
  },
  {
    title: "Stock",
    icon: ClipboardPen,
    path: "stock",
    index: 3,
  },
  {
    title: "Configuración",
    icon: Settings,
    path: "settings",
    index: 4,
  },
  {
    title: "Estadísticas",
    icon: BarChart4,
    path: "statistics",
    index: 5,
  },
  // {
  //   title: "Canchas",
  //   icon: MapPin,
  //   path: "courts",
  //   index: 6,
  // },
  // {
  //   title: "Clientes",
  //   icon: Users,
  //   path: "clients",
  //   index: 7,
  // },
];

const SideBar = ({ currentUser }: SideBarProps) => {
  // const { setExpanded } = useSideBarContext();
  const pathname = usePathname();
  // console.log(pathname);
  // const complex = pathname.split("/")[1];
  const router = useRouter();
  const [active, setActive] = useState<number>(pathToIndex[pathname.split("/")[2]] ?? 0);
  const { setOpenMobile } = useSidebar();

  const filteredSidebarItems = sidebarItems.filter((item) => {
    // Ejemplo: solo ADMIN puede ver Configuración y Estadísticas
    if (
      (item.path === "settings" || item.path === "statistics") &&
      currentUser?.user.role !== "COMPLEJO_ADMIN"
    ) {
      return false;
    }
    // Puedes agregar más reglas según el rol y el path
    return true;
  });

  const handleClick = (index: number, path: string) => {
    setActive(index);
    setOpenMobile(false);
    if (index === 0) {
      router.push(`/dashboard`);
      return;
    }
    router.push(`/dashboard/${path}`);
    // setExpanded((value) => (value ? !value : value));
  };

  return (
    <Sidebar className="border-r border-gray-200 bg-white shadow-sm">
      <SidebarHeader className="border-b border-gray-200">
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900 text-white">
            <a href={`/`}>
              <LayoutDashboard className="h-5 w-5 hover:cursor-pointer" />
            </a>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-gray-900">Cancha Bertaca</span>
            <span className="text-xs text-gray-500">Administración</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-500 text-xs font-medium uppercase tracking-wider">
            Menú Principal
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredSidebarItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={active === item.index}
                    className="text-gray-600 hover:bg-gray-100 hover:text-gray-900 data-[active=true]:bg-gray-100 data-[active=true]:text-gray-900 data-[active=true]:font-medium"
                  >
                    <div
                      onClick={() => handleClick(item.index, item.path)}
                      className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-md transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
