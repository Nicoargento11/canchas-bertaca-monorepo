"use client";
import React, { useState, useEffect } from "react";
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
  Building,
  Building2,
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
  const pathname = usePathname();
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  // Extraer el slug de la URL actual (ej: /bertaca/dashboard -> bertaca)
  const pathParts = pathname.split("/").filter(Boolean);
  const currentSlug = pathParts[0] || currentUser?.user.complexSlug || "bertaca";

  // Determinar el índice activo basado en la ruta actual
  const getActiveIndex = () => {
    if (pathname.includes("/dashboard/reserves")) return 1;
    if (pathname.includes("/dashboard/payments")) return 2;
    if (pathname.includes("/dashboard/stock")) return 3;
    if (pathname.includes("/dashboard/settings")) return 4;
    if (pathname.includes("/dashboard/statistics")) return 5;
    if (pathname.includes("/dashboard")) return 0;
    return 0;
  };

  const [active, setActive] = useState<number>(getActiveIndex());

  // Actualizar el índice activo cuando cambia la ruta
  useEffect(() => {
    setActive(getActiveIndex());
  }, [pathname]);

  const filteredSidebarItems = sidebarItems.filter((item) => {
    const userRole = currentUser?.user.role;

    // SUPER_ADMIN y ORGANIZACION_ADMIN ven todo
    if (userRole === "SUPER_ADMIN" || userRole === "ORGANIZACION_ADMIN") {
      return true;
    }

    // COMPLEJO_ADMIN ve todo de su complejo
    if (userRole === "COMPLEJO_ADMIN") {
      return true;
    }

    // RECEPCION no ve Configuración ni Estadísticas
    if (userRole === "RECEPCION") {
      if (item.path === "settings" || item.path === "statistics") {
        return false;
      }
      return true;
    }

    // USUARIO no debería estar aquí, pero por si acaso, no mostrar nada
    return false;
  });

  const handleClick = (index: number, path: string) => {
    setActive(index);
    setOpenMobile(false);
    if (index === 0) {
      router.push(`/${currentSlug}/dashboard`);
      return;
    }
    router.push(`/${currentSlug}/dashboard/${path}`);
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
            <span className="text-base font-semibold text-gray-900 capitalize">
              {currentSlug.replace(/-/g, " ")}
            </span>
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
                      className="flex items-center gap-2 md:gap-3 cursor-pointer px-2 md:px-4 py-2 rounded-md transition-colors"
                    >
                      <item.icon className="h-4 w-4" />
                      <span className="text-sm md:text-base">{item.title}</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {currentUser?.user.role === "SUPER_ADMIN" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-gray-500 text-xs font-medium uppercase tracking-wider">
              Super Admin
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <div
                      onClick={() => {
                        setOpenMobile(false);
                        router.push("/super-admin/users");
                      }}
                      className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-md transition-colors"
                    >
                      <Users className="h-4 w-4" />
                      <span>Usuarios</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <div
                      onClick={() => {
                        setOpenMobile(false);
                        router.push("/super-admin/organizations");
                      }}
                      className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-md transition-colors"
                    >
                      <Building2 className="h-4 w-4" />
                      <span>Organizaciones</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    className="text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  >
                    <div
                      onClick={() => {
                        setOpenMobile(false);
                        router.push("/super-admin/complexes");
                      }}
                      className="flex items-center gap-3 cursor-pointer px-4 py-2 rounded-md transition-colors"
                    >
                      <Building className="h-4 w-4" />
                      <span>Complejos</span>
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
};

export default SideBar;
