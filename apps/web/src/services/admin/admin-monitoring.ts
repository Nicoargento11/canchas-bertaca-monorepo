import axios from "axios";
import api from "../api";

export type MonitoringSeverity = "ok" | "info" | "warning" | "critical";

export type MonitoringRangeQuery = {
  from?: string;
  to?: string;
  complexId?: string;
  organizationId?: string;
  staleHours?: number;
  inactiveDays?: number;
};

type AdminMonitoringResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

const handleError = (error: unknown): AdminMonitoringResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = (error.response.data as any)?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: "No autorizado" };
      if (status === 403) return { success: false, error: "No tiene permisos" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export type MonitoringHealth = {
  now: string;
  uptimeSeconds: number;
  node: string;
  env: string | null;
};

export type MonitoringOverview = {
  range: { from: string; to: string };
  totals: { organizations: number; complexes: number; users: number };
  activity: { reservesCreated: number; reservesCancelled: number; paymentsCreated: number };
  flags: {
    reservesPendingExpired: number;
    orphanPayments: number;
    inactivePaymentConfigs: number;
    activeCashSessions: number;
  };
};

export type MonitoringIntegrity = {
  range: { from: string; to: string };
  rules: {
    pendingExpired: { severity: MonitoringSeverity; count: number };
    paymentsMissingTenant: { severity: MonitoringSeverity; count: number; sample?: any[] };
    orphanPayments: { severity: MonitoringSeverity; count: number; sample?: any[] };
    reservesWithPaymentTokenNoPayments: {
      severity: MonitoringSeverity;
      count: number;
      sample?: any[];
    };
    activeComplexesMissingPaymentConfig: {
      severity: MonitoringSeverity;
      count: number;
      sample?: any[];
    };
    staleCashSessions: {
      severity: MonitoringSeverity;
      thresholds: { warningHours: number; criticalHours: number };
      warning: { count: number; sample?: any[] };
      critical: { count: number; sample?: any[] };
    };
    silentTenants: {
      severity: MonitoringSeverity;
      thresholdDays: number;
      count: number;
      sample?: Array<{
        id: string;
        name: string;
        slug: string;
        isActive: boolean;
        organization: { id: string; name: string; isActive: boolean } | null;
        lastActivityAt: string | null;
      }>;
    };
  };
};

const toQueryString = (query: Record<string, unknown>) => {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
};

export const getMonitoringHealth = async (): Promise<AdminMonitoringResult<MonitoringHealth>> => {
  try {
    const response = await api.get(`/admin/monitoring/health`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getMonitoringOverview = async (
  query: MonitoringRangeQuery = {}
): Promise<AdminMonitoringResult<MonitoringOverview>> => {
  try {
    const response = await api.get(`/admin/monitoring/overview${toQueryString(query)}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getMonitoringAnomalies = async (
  query: MonitoringRangeQuery = {}
): Promise<AdminMonitoringResult<any>> => {
  try {
    const response = await api.get(`/admin/monitoring/anomalies${toQueryString(query)}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getMonitoringIntegrity = async (
  query: MonitoringRangeQuery = {}
): Promise<AdminMonitoringResult<MonitoringIntegrity>> => {
  try {
    const response = await api.get(`/admin/monitoring/integrity${toQueryString(query)}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};

export const getMonitoringTenants = async (
  query: MonitoringRangeQuery = {}
): Promise<AdminMonitoringResult<any>> => {
  try {
    const response = await api.get(`/admin/monitoring/tenants${toQueryString(query)}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleError(error);
  }
};
