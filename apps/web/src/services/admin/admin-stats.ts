import axios from "axios";
import api from "../api";

type AdminStatsResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type DashboardStats = {
  totalOrganizations: number;
  totalComplexes: number;
  totalUsers: number;
  activeReservations: number;
};

const handleStatsError = (error: unknown): AdminStatsResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: "No autorizado" };
      if (status === 403) return { success: false, error: "No tiene permisos" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const getDashboardStats = async (): Promise<AdminStatsResult<DashboardStats>> => {
  try {
    const response = await api.get(`/admin/stats`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleStatsError(error);
  }
};

export const getRecentActivity = async (): Promise<AdminStatsResult<any>> => {
  try {
    const response = await api.get(`/admin/stats/activity`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleStatsError(error);
  }
};
