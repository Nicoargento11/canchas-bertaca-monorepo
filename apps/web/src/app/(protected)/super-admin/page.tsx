"use client";

import { useState, useEffect } from "react";
import { Building2, Users, MapPin, Activity } from "lucide-react";
import { getDashboardStats } from "@/services/admin/admin-stats";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Complejos",
      value: stats.totalComplexes,
      icon: MapPin,
      iconBg: "bg-green-50",
      iconColor: "text-green-600",
    },
    {
      title: "Usuarios",
      value: stats.totalUsers,
      icon: Users,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
    {
      title: "Reservas Activas",
      value: stats.activeReservations,
      icon: Activity,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Vista general del sistema</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="shadow-sm border-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`${stat.iconBg} p-2.5 rounded-xl`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="shadow-sm border-border/60">
        <CardHeader>
          <CardTitle className="text-lg md:text-xl text-gray-900">Actividad Reciente</CardTitle>
        </CardHeader>
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
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all"
            >
              <div>
                <p className="text-gray-900 font-medium">{activity.action}</p>
                <p className="text-muted-foreground text-sm">{activity.detail}</p>
              </div>
              <span className="text-muted-foreground text-xs">{activity.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
