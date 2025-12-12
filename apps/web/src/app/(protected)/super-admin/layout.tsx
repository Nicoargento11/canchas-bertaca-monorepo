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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50">
        <div className="p-6 border-b border-slate-800/50">
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-bold">SA</span>
            </div>
            Super Admin
          </h1>
          <p className="text-slate-400 text-xs mt-1">God Mode Activated</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all group border border-slate-700/50"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium">Volver al Home</span>
          </Link>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800/50 hover:text-white transition-all group"
            >
              <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800/50">
          <button
            onClick={() => router.push("/logout")}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">{children}</main>
    </div>
  );
}
