"use client";

import { useState, useEffect } from "react";
import {
  Building2,
  Users,
  MapPin,
  Activity,
  AlertTriangle,
  ShieldAlert,
  Clock,
} from "lucide-react";
import { getDashboardStats } from "@/services/admin/admin-stats";
import {
  getMonitoringHealth,
  getMonitoringIntegrity,
  getMonitoringOverview,
  type MonitoringHealth,
  type MonitoringIntegrity,
  type MonitoringOverview,
} from "@/services/admin/admin-monitoring";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({
    totalOrganizations: 0,
    totalComplexes: 0,
    totalUsers: 0,
    activeReservations: 0,
  });

  const [health, setHealth] = useState<MonitoringHealth | null>(null);
  const [overview, setOverview] = useState<MonitoringOverview | null>(null);
  const [integrity, setIntegrity] = useState<MonitoringIntegrity | null>(null);
  const [loadingMonitoring, setLoadingMonitoring] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchMonitoring();
  }, []);

  const fetchStats = async () => {
    const result = await getDashboardStats();
    if (result.success && result.data) {
      setStats(result.data);
    } else {
      toast.error(result.error || "Error al cargar estadísticas");
    }
  };

  const fetchMonitoring = async () => {
    setLoadingMonitoring(true);
    try {
      const [healthRes, overviewRes, integrityRes] = await Promise.all([
        getMonitoringHealth(),
        getMonitoringOverview(),
        getMonitoringIntegrity({ inactiveDays: 14, staleHours: 24 }),
      ]);

      if (healthRes.success && healthRes.data) setHealth(healthRes.data);
      if (overviewRes.success && overviewRes.data) setOverview(overviewRes.data);
      if (integrityRes.success && integrityRes.data) setIntegrity(integrityRes.data);

      if (!healthRes.success || !overviewRes.success || !integrityRes.success) {
        const msg =
          healthRes.error || overviewRes.error || integrityRes.error || "Error al cargar monitoreo";
        toast.error(msg);
      }
    } finally {
      setLoadingMonitoring(false);
    }
  };

  const getSeverityStyles = (severity: string) => {
    if (severity === "critical")
      return { badge: "bg-red-50 text-red-700 border-red-200", icon: ShieldAlert };
    if (severity === "warning")
      return { badge: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle };
    if (severity === "info")
      return { badge: "bg-blue-50 text-blue-700 border-blue-200", icon: Activity };
    return { badge: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Activity };
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
        <p className="text-sm text-muted-foreground">Centro de monitoreo del sistema</p>
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
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="shadow-sm border-border/60 xl:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg md:text-xl text-gray-900">Monitoreo</CardTitle>
            <button
              type="button"
              onClick={fetchMonitoring}
              className="text-sm px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900"
            >
              {loadingMonitoring ? "Actualizando..." : "Actualizar"}
            </button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700">
                <Clock className="w-4 h-4" />
                {health ? `Uptime: ${health.uptimeSeconds}s` : "Uptime: —"}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700">
                {health ? `Node: ${health.node}` : "Node: —"}
              </span>
              <span className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-700">
                {overview
                  ? `Rango: ${new Date(overview.range.from).toLocaleDateString()} → ${new Date(overview.range.to).toLocaleDateString()}`
                  : "Rango: —"}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {integrity &&
                [
                  {
                    key: "pendingExpired",
                    title: "Reservas pendientes vencidas",
                    value: integrity.rules.pendingExpired.count,
                    severity: integrity.rules.pendingExpired.severity,
                  },
                  {
                    key: "orphanPayments",
                    title: "Pagos huérfanos",
                    value: integrity.rules.orphanPayments.count,
                    severity: integrity.rules.orphanPayments.severity,
                  },
                  {
                    key: "paymentsMissingTenant",
                    title: "Pagos sin complejo",
                    value: integrity.rules.paymentsMissingTenant.count,
                    severity: integrity.rules.paymentsMissingTenant.severity,
                  },
                  {
                    key: "staleCashSessions",
                    title: "Caja abierta (stale)",
                    value: integrity.rules.staleCashSessions.warning.count,
                    severity: integrity.rules.staleCashSessions.severity,
                  },
                  {
                    key: "silentTenants",
                    title: "Tenants silenciosos",
                    value: integrity.rules.silentTenants.count,
                    severity: integrity.rules.silentTenants.severity,
                  },
                  {
                    key: "missingPaymentConfig",
                    title: "Complejos sin PaymentConfig",
                    value: integrity.rules.activeComplexesMissingPaymentConfig.count,
                    severity: integrity.rules.activeComplexesMissingPaymentConfig.severity,
                  },
                ].map((item) => {
                  const s = getSeverityStyles(item.severity);
                  const Icon = s.icon;
                  return (
                    <div key={item.key} className="p-4 rounded-2xl border border-gray-200 bg-white">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm text-muted-foreground">{item.title}</p>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${s.badge}`}
                        >
                          <Icon className="w-3.5 h-3.5" />
                          {item.severity}
                        </span>
                      </div>
                      <div className="mt-2 text-2xl font-bold text-gray-900">{item.value}</div>
                    </div>
                  );
                })}

              {!integrity && (
                <div className="col-span-full text-sm text-muted-foreground">
                  {loadingMonitoring ? "Cargando monitoreo..." : "Sin datos de monitoreo"}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/60">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl text-gray-900">Tenants silenciosos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(integrity?.rules.silentTenants.sample || []).slice(0, 6).map((c) => (
                <div key={c.id} className="p-4 rounded-xl bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-gray-900 font-semibold truncate">{c.name}</p>
                      <p className="text-xs text-muted-foreground truncate">/{c.slug}</p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {c.lastActivityAt
                        ? new Date(c.lastActivityAt).toLocaleDateString()
                        : "Sin actividad"}
                    </span>
                  </div>
                </div>
              ))}

              {integrity && (integrity.rules.silentTenants.sample || []).length === 0 && (
                <div className="text-sm text-muted-foreground">Sin tenants silenciosos</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
