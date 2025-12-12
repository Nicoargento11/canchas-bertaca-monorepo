"use client";

import { useState, useEffect } from "react";
import { Building2, Users, MapPin, Activity } from "lucide-react";
import { getDashboardStats } from "@/services/admin/admin-stats";
import { toast } from "sonner";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalComplexes: 0,
    totalUsers: 0,
    activeReservations: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const result = await getDashboardStats();
    if (result.success && result.data) {
      setStats(result.data);
    } else {
      toast.error(result.error || "Error al cargar estadísticas");
    }
  };

  const statCards = [
    {
      title: "Organizaciones",
      value: stats.totalOrganizations,
      icon: Building2,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-500/10",
      textColor: "text-blue-400",
    },
    {
      title: "Complejos",
      value: stats.totalComplexes,
      icon: MapPin,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-500/10",
      textColor: "text-green-400",
    },
    {
      title: "Usuarios",
      value: stats.totalUsers,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-500/10",
      textColor: "text-purple-400",
    },
    {
      title: "Reservas Activas",
      value: stats.activeReservations,
      icon: Activity,
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-500/10",
      textColor: "text-orange-400",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-slate-400">Vista general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.title}
            className="relative overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6 hover:border-slate-700/50 transition-all group"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-slate-400 text-sm font-medium mb-2">{stat.title}</p>
                <p className="text-4xl font-bold text-white">{stat.value}</p>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-xl`}>
                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
              </div>
            </div>

            {/* Gradient overlay on hover */}
            <div
              className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-5 transition-opacity`}
            />
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Actividad Reciente</h2>
        <div className="space-y-3">
          {[
            {
              action: "Nueva organización creada",
              detail: "Club Deportivo Norte",
              time: "Hace 2 horas",
            },
            {
              action: "Complejo agregado",
              detail: "Cancha Seven - Seven FC",
              time: "Hace 5 horas",
            },
            { action: "Usuario registrado", detail: "juan.perez@example.com", time: "Hace 1 día" },
            { action: "Reserva completada", detail: "Cancha F5 - Bertaca", time: "Hace 2 días" },
          ].map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-4 bg-slate-800/30 rounded-xl hover:bg-slate-800/50 transition-all"
            >
              <div>
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-slate-400 text-sm">{activity.detail}</p>
              </div>
              <span className="text-slate-500 text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
