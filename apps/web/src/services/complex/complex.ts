import api from "../api";
import axios from "axios";
import { UnavailableDay } from "../unavailable-day/unavailable-day";
import { Court } from "../court/court";
import { FixedReserve } from "../fixed-reserve/fixed-reserve";
import { Schedule } from "../schedule/schedule";
import { ScheduleDay } from "../schedule-day/schedule-day";
import { Rate } from "../rate/rate";
import { Organization } from "../organization/organization";
import { SportType } from "../sport-types/sport-types";
import { Product } from "../product/product";
import { ProductSale } from "../product-sale.ts/product-sale";
import { Payment } from "../payment/payment";
import { CashRegister } from "../cash-register/cash-register";

type ComplexResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Complex = {
  id: string;
  name: string;
  email: string | null;
  address: string;
  slug: string;
  isActive: boolean;
  services: string[];
  organizationId: string | null;
  createdAt: string;
  updatedAt: string;

  // notifications:   Notification[]
  // posts:           Post[]
  // managers        User[]
  Organization: Organization | null;
  courts: Court[];
  fixedReserves: FixedReserve[];
  schedules: Schedule[];
  scheduleDays: ScheduleDay[];
  rates: Rate[];
  unavailableDays: UnavailableDay[];
  sportTypes: SportType[];

  products: Product[];
  productSales: ProductSale[];
  payments: Payment[];

  cashRegisters: CashRegister[];
  // inventoryMovements: InventoryMovement[];
};

const handleComplexError = (error: unknown): ComplexResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 404) return { success: false, error: message || "Complejo no encontrado" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const createComplex = async (data: any): Promise<ComplexResult<Complex>> => {
  try {
    const response = await api.post("/complexes", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const getComplexes = async (page = 1, limit = 10): Promise<ComplexResult<Complex[]>> => {
  try {
    const response = await api.get(`/complexes?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const getComplexById = async (id: string): Promise<ComplexResult> => {
  try {
    const response = await api.get(`/complexes/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const getComplexBySlug = async (slug: string): Promise<ComplexResult<Complex>> => {
  try {
    const response = await api.get(`/complexes/slug/${slug}`);

    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const updateComplex = async (id: string, data: any): Promise<ComplexResult> => {
  try {
    const response = await api.patch(`/complexes/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const deleteComplex = async (id: string): Promise<ComplexResult> => {
  try {
    const response = await api.delete(`/complexes/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const toggleComplexStatus = async (id: string): Promise<ComplexResult> => {
  try {
    const response = await api.patch(`/complexes/${id}/toggle-status`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

// ==================== MERCADOPAGO ====================

export type MercadoPagoConfig = {
  accessToken: string;
  publicKey: string;
  clientId?: string;
  clientSecret?: string;
};

export type MercadoPagoConfigResponse = {
  id: string;
  publicKey: string;
  clientId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export const exchangeMercadoPagoOAuth = async (
  complexId: string,
  code: string,
  redirectUri: string
): Promise<ComplexResult> => {
  try {
    const response = await api.post(`/complexes/${complexId}/mercadopago/oauth`, {
      code,
      redirectUri,
    });
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const saveMercadoPagoConfig = async (
  complexId: string,
  config: MercadoPagoConfig
): Promise<ComplexResult<MercadoPagoConfigResponse>> => {
  try {
    const response = await api.post(`/complexes/${complexId}/mercadopago`, config);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const getMercadoPagoConfig = async (
  complexId: string
): Promise<ComplexResult<MercadoPagoConfigResponse>> => {
  try {
    const response = await api.get(`/complexes/${complexId}/mercadopago`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const checkMercadoPagoStatus = async (
  complexId: string
): Promise<ComplexResult<{ hasConfig: boolean }>> => {
  try {
    const response = await api.get(`/complexes/${complexId}/mercadopago/status`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const deactivateMercadoPagoConfig = async (complexId: string): Promise<ComplexResult> => {
  try {
    const response = await api.delete(`/complexes/${complexId}/mercadopago`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};
