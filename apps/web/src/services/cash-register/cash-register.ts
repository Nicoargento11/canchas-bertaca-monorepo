// src/services/cash-register/cash-register.ts
import api from "../api";
import { AxiosError } from "axios";
import { Complex } from "../complex/complex";

export type CashRegister = {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
  complex?: Complex;
  complexId: string;
  createdAt: string;
  updatedAt: string;
};

export type CashRegisterResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GenericError {
  status?: number;
  message?: string;
  data?: any;
}

const handleCashRegisterError = (error: unknown): CashRegisterResult => {
  if (error instanceof AxiosError) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 403)
        return { success: false, error: message || "No tiene permisos para esta acción" };
      if (status === 404) return { success: false, error: message || "Caja no encontrada" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };
      if (status === 400)
        return { success: false, error: error.response.data?.message || "Datos inválidos" };

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

export const createCashRegister = async (
  data: Omit<CashRegister, "id" | "createdAt" | "updatedAt">
): Promise<CashRegisterResult<CashRegister>> => {
  try {
    const response = await api.post("/cash-registers", data);

    return { success: true, data: response.data };
  } catch (error) {
    return handleCashRegisterError(error);
  }
};

export const getAllCashRegisters = async (
  complexId: string
): Promise<CashRegisterResult<CashRegister[]>> => {
  try {
    const response = await api.get("/cash-registers", { params: { complexId } });
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashRegisterError(error);
  }
};

export const getCashRegisterById = async (
  id: string
): Promise<CashRegisterResult<CashRegister>> => {
  try {
    const response = await api.get(`/cash-registers/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashRegisterError(error);
  }
};

export const updateCashRegister = async (
  id: string,
  data: Partial<CashRegister>
): Promise<CashRegisterResult<CashRegister>> => {
  try {
    const response = await api.patch(`/cash-registers/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashRegisterError(error);
  }
};

export const deactivateCashRegister = async (id: string): Promise<CashRegisterResult> => {
  try {
    const response = await api.delete(`/cash-registers/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashRegisterError(error);
  }
};

export const activateCashRegister = async (
  id: string
): Promise<CashRegisterResult<CashRegister>> => {
  try {
    const response = await api.patch(`/cash-registers/${id}/activate`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleCashRegisterError(error);
  }
};
