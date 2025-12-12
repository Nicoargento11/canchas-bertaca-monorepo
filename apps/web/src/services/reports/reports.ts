import api from "../api";
import { AxiosError } from "axios";
import { PaymentMethod } from "../payment/payment";
import { SportTypeKey } from "../sport-types/sport-types";
import { DashboardData } from "@/app/(protected)/[slug]/dashboard/statistics/page";

export interface DailySummaryByCourt {
  courtId: string;
  courtName: string;
  courtNumber: number | null;
  sportType: SportTypeKey;
  sportTypeName: string;
  totalRevenue: number;
  totalReservations: number;
  totalReservationAmount: number;
  totalPaid: number;
  paymentsByMethod: {
    method: PaymentMethod;
    amount: number;
    count: number;
  }[];
  reservations: {
    id: string;
    schedule: string;
    clientName: string | null;
    phone: string;
    status: string;
    price: number;
    reservationAmount: number;
    totalPaid: number;
  }[];
}

export interface DailyProductSales {
  productId: string;
  productName: string;
  category: string;
  totalQuantity: number;
  totalRevenue: number;
  sales: {
    id: string;
    quantity: number;
    price: number;
    discount: number | null;
    isGift: boolean;
    soldAt: Date;
    paymentMethod: PaymentMethod;
  }[];
}

export interface DailySummaryResponse {
  date: string;
  complexId: string;
  complexName: string;
  courts: DailySummaryByCourt[];
  products: DailyProductSales[];
  totals: {
    totalRevenueReserves: number;
    totalRevenueProducts: number;
    totalRevenue: number;
    totalReservations: number;
    totalProductsSold: number;
    paymentMethodSummary: {
      method: PaymentMethod;
      amount: number;
      count: number;
    }[];
  };
}

export interface DateRangeSummaryResponse {
  startDate: string;
  endDate: string;
  complexId: string;
  complexName: string;
  dailySummaries: {
    date: string;
    totalRevenue: number;
    totalReservations: number;
    totalProductsSold: number;
  }[];
  totals: {
    totalRevenue: number;
    totalReservations: number;
    totalProductsSold: number;
    averageDailyRevenue: number;
    paymentMethodSummary: {
      method: PaymentMethod;
      amount: number;
      count: number;
    }[];
  };
}

type ReportResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GenericError {
  status?: number;
  message?: string;
  data?: any;
}

export const getDailySummary = async (
  date: string,
  complexId: string,
  cashSessionId: string
): Promise<ReportResult<DailySummaryResponse>> => {
  try {
    const response = await api.get("/reports/daily-summary", {
      params: {
        date,
        complexId,
        cashSessionId,
      },
    });
    // if (!response.ok) throw new Error("No autorizado");
    // const data = await response.json();
    return { success: true, data: response.data.data };
  } catch (error) {
    return handleReportError(error);
  }
};

export const getCourtsSummary = async (
  date: string,
  complexId: string
): Promise<ReportResult<DailySummaryByCourt[]>> => {
  try {
    const response = await api.get("/reports/courts-summary", {
      params: { date, complexId },
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    return handleReportError(error);
  }
};

export const getProductsSummary = async (
  date: string,
  complexId: string
): Promise<ReportResult<DailyProductSales[]>> => {
  try {
    const response = await api.get("/reports/products-summary", {
      params: { date, complexId },
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    return handleReportError(error);
  }
};

export const getDateRangeSummary = async (
  startDate: string,
  endDate: string,
  complexId: string
): Promise<ReportResult<DateRangeSummaryResponse>> => {
  try {
    const response = await api.get("/reports/date-range-summary", {
      params: { startDate, endDate, complexId },
    });
    return { success: true, data: response.data.data };
  } catch (error) {
    return handleReportError(error);
  }
};

export const exportDailySummaryExcel = async (
  date: string,
  complexId: string,
  cashSessionId?: string
): Promise<Blob> => {
  try {
    const params: any = { date, complexId };
    if (cashSessionId) {
      params.cashSessionId = cashSessionId;
    }
    const response = await api.get("/reports/daily-summary/export/excel", {
      params,
      responseType: "blob",
    });
    return new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
  } catch (error) {
    throw handleReportError(error);
  }
};

export const exportDailySummaryPDF = async (
  date: string,
  complexId: string,
  cashSessionId?: string
): Promise<Blob> => {
  try {
    const params: any = { date, complexId };
    if (cashSessionId) {
      params.cashSessionId = cashSessionId;
    }
    const response = await api.get("/reports/daily-summary/export/pdf", {
      params,
      responseType: "blob",
    });
    return new Blob([response.data], { type: "application/pdf" });
  } catch (error) {
    throw handleReportError(error);
  }
};

// Utility function to trigger file download
export const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

const handleReportError = (error: unknown): ReportResult => {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 400) return { success: false, error: "Parámetros inválidos" };
      if (status === 401) return { success: false, error: "No autorizado" };
      if (status === 404) return { success: false, error: "Complejo no encontrado" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  const genericError = error as GenericError;
  if (genericError.status && genericError.message) {
    return {
      success: false,
      error: genericError.message || `Error ${genericError.status}`,
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Error desconocido",
  };
};

// Utility function to format date as YYYY-MM-DD
export const formatReportDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const getDashboard = async (
  complexId: string,
  startDate?: string,
  endDate?: string,
  cashSessionId?: string
): Promise<ReportResult<DashboardData>> => {
  try {
    const params: any = { complexId };

    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (cashSessionId) params.cashSessionId = cashSessionId;

    const response = await api.get("/reports/dashboard", { params });
    return { success: true, data: response.data.data };
  } catch (error) {
    return handleReportError(error);
  }
};
