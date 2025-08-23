// src/services/cash-session/cash-session.ts
import api from "../api";
import axios from "axios";
import { CashRegister } from "../cash-register/cash-register";
import { User } from "../user/user";

export type SessionStatus = "ACTIVE" | "CLOSED" | "CANCELLED";

export type CashSession = {
  id: string;
  cashRegister: CashRegister;
  cashRegisterId: string;
  user: User;
  userId: string;
  startAt: string;
  endAt?: string;
  initialAmount: number;
  finalAmount?: number;
  totalCash?: number;
  totalCard?: number;
  totalTransfers?: number;
  status: SessionStatus;
  observations?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CashSessionSummary = CashSession & {
  totals: {
    CASH: number;
    CARD: number;
    TRANSFER: number;
    MERCADOPAGO: number;
    OTHER: number;
  };
  difference?: number;
};
export type CashSessionResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GenericError {
  status?: number;
  message?: string;
  data?: any;
}

const handleCashSessionError = (error: unknown): CashSessionResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";
      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 403)
        return { success: false, error: message || "No tiene permisos para esta acción" };
      if (status === 404) return { success: false, error: message || "Sesión no encontrada" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };
      if (status === 400) return { success: false, error: message || "Datos inválidos" };

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

export const openCashSession = async (data: {
  cashRegisterId: string;
  // userId: string;
  initialAmount: number;
}): Promise<CashSessionResult<CashSession>> => {
  try {
    const response = await api.post("/cash-sessions/open", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashSessionError(error);
  }
};

export const closeCashSession = async (
  sessionId: string,
  data: { finalAmount: number; observations?: string }
): Promise<CashSessionResult<CashSession>> => {
  try {
    const response = await api.post(`/cash-sessions/${sessionId}/close`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashSessionError(error);
  }
};

export const getActiveCashSession = async (
  cashRegisterId: string
): Promise<CashSessionResult<CashSession>> => {
  try {
    const response = await api.get(`/cash-sessions/active?cashRegisterId=${cashRegisterId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashSessionError(error);
  }
};

export const getActiveCashSessionByUser = async (
  userId: string
): Promise<CashSessionResult<CashSession>> => {
  try {
    const response = await api.get(`/cash-sessions/user/active?userId=${userId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashSessionError(error);
  }
};

export const getCashSessionSummary = async (
  sessionId: string
): Promise<CashSessionResult<CashSessionSummary>> => {
  try {
    const response = await api.get(`/cash-sessions/${sessionId}/summary`);

    // Debug: Verifica exactamente qué devuelve el backend

    return {
      success: true,
      data: {
        ...response.data,
        totals: {
          CASH: response.data.totals?.CASH || 0,
          CARD: response.data.totals?.CARD || 0,
          TRANSFER: response.data.totals?.TRANSFER || 0,
          MERCADOPAGO: response.data.totals?.MERCADOPAGO || 0,
          OTHER: response.data.totals?.OTHER || 0,
        },
        difference: response.data.difference || 0,
      },
    };
  } catch (error) {
    console.error("Error en getCashSessionSummary:", error);
    return handleCashSessionError(error);
  }
};

export const getCashSessionHistory = async (
  cashRegisterId: string,
  days: number = 30
): Promise<CashSessionResult<CashSession[]>> => {
  try {
    const response = await api.get(
      `/cash-sessions/history?cashRegisterId=${cashRegisterId}&days=${days}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashSessionError(error);
  }
};

// Para exportar a Excel
export const exportToExcel = async (
  cashRegisterId: string,
  startDate: Date,
  endDate: Date
): Promise<CashSessionResult<Blob>> => {
  try {
    const response = await api.get(
      `/cash-sessions/export?cashRegisterId=${cashRegisterId}&start=${startDate.toISOString()}&end=${endDate.toISOString()}`,
      { responseType: "blob" }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashSessionError(error);
  }
};

// Para el panel de administración
export const getCashRegisterStatus = async (
  complexId: string
): Promise<CashSessionResult<{ active: number; total: number; lastActivity?: string }>> => {
  try {
    const response = await api.get(`/cash-sessions/status?complexId=${complexId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashSessionError(error);
  }
};

export const cancelCashSession = async (
  sessionId: string,
  reason: string
): Promise<CashSessionResult<CashSession>> => {
  try {
    const response = await api.post(
      `/cash-sessions/${sessionId}/cancel`,
      { reason },
      { headers: { "Content-Type": "application/json" } }
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashSessionError(error);
  }
};
