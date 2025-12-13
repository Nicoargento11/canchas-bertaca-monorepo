"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Building2, Users, MapPin, Settings, LogOut, Home } from "lucide-react";

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/super-admin" },
    { icon: Building2, label: "Organizaciones", href: "/super-admin/organizations" },
    { icon: MapPin, label: "Complejos", href: "/super-admin/complexes" },
    { icon: Users, label: "Usuarios", href: "/super-admin/users" },
    { icon: Settings, label: "Configuración", href: "/super-admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-full md:fixed md:left-0 md:top-0 md:h-full md:w-64 bg-white border-b md:border-b-0 md:border-r border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200">
              <span className="text-gray-900 text-sm font-bold">SA</span>
            </div>
            Super Admin
          </h1>
          <p className="text-gray-500 text-xs mt-1">Panel de administración</p>
        </div>

        <nav className="p-4 flex gap-2 overflow-x-auto md:block md:space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all group border border-gray-200 whitespace-nowrap shrink-0"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Volver al Home</span>
          </Link>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-all group whitespace-nowrap shrink-0"
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="md:absolute md:bottom-0 md:left-0 md:right-0 p-4 border-t border-gray-200">
          <button
            onClick={() => router.push("/logout")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64 p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}
