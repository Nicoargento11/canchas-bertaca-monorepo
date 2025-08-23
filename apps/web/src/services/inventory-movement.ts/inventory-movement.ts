import api from "../api";
import axios, { AxiosError } from "axios";
import { Product } from "../product/product";
import { Complex } from "../complex/complex";

export type InventoryMovement = {
  id: string;
  type: MovementType;
  quantity: number;
  reason?: string;
  product?: Product;
  productId: string;
  complex?: Complex;
  complexId: string;
  createdAt: string;
  updatedAt: string;
};

export type MovementType = "COMPRA" | "VENTA" | "AJUSTE" | "PERDIDA" | "DEVOLUCION" | "REGALO";

export type InventoryMovementResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GenericError {
  status?: number;
  message?: string;
  data?: any;
}

const handleInventoryMovementError = (error: unknown): InventoryMovementResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 403)
        return { success: false, error: message || "No tiene permisos para esta acción" };
      if (status === 404)
        return { success: false, error: message || "Movimiento de inventario no encontrado" };
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

export const createInventoryMovement = async (
  data: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt" | "product" | "complex">
): Promise<InventoryMovementResult<InventoryMovement>> => {
  try {
    const response = await api.post("/inventory-movements", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};

export const getAllInventoryMovements = async (): Promise<
  InventoryMovementResult<InventoryMovement[]>
> => {
  try {
    const response = await api.get("/inventory-movements");
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};

export const getPaginatedInventoryMovements = async (
  page = 1,
  limit = 10
): Promise<InventoryMovementResult<InventoryMovement[]>> => {
  try {
    const response = await api.get(`/inventory-movements/paginate?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};

export const getInventoryMovementById = async (
  id: string
): Promise<InventoryMovementResult<InventoryMovement>> => {
  try {
    const response = await api.get(`/inventory-movements/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};

export const getInventoryMovementsByProduct = async (
  productId: string
): Promise<InventoryMovementResult<InventoryMovement[]>> => {
  try {
    const response = await api.get(`/inventory-movements/by-product/${productId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};

export const getInventoryMovementsByComplex = async (
  complexId: string
): Promise<InventoryMovementResult<InventoryMovement[]>> => {
  try {
    const response = await api.get(`/inventory-movements/by-complex/${complexId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};

export const updateInventoryMovement = async (
  id: string,
  data: Partial<Omit<InventoryMovement, "id" | "createdAt" | "updatedAt" | "product" | "complex">>
): Promise<InventoryMovementResult<InventoryMovement>> => {
  try {
    const response = await api.patch(`/inventory-movements/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};

export const deleteInventoryMovement = async (id: string): Promise<InventoryMovementResult> => {
  try {
    const response = await api.delete(`/inventory-movements/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};

export const filterInventoryMovements = async (params: {
  type?: MovementType;
  productId?: string;
  complexId?: string;
  startDate?: string;
  endDate?: string;
}): Promise<InventoryMovementResult<InventoryMovement[]>> => {
  try {
    const queryParams = new URLSearchParams();

    if (params.type) queryParams.append("type", params.type);
    if (params.productId) queryParams.append("productId", params.productId);
    if (params.complexId) queryParams.append("complexId", params.complexId);
    if (params.startDate) queryParams.append("start", params.startDate);
    if (params.endDate) queryParams.append("end", params.endDate);

    const response = await api.get(`/inventory-movements/filter?${queryParams.toString()}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};

export const getInventoryMovementsByDateRange = async (
  startDate: string,
  endDate: string,
  complexId?: string
): Promise<InventoryMovementResult<InventoryMovement[]>> => {
  try {
    const url = complexId
      ? `/inventory-movements/by-date?start=${startDate}&end=${endDate}&complexId=${complexId}`
      : `/inventory-movements/by-date?start=${startDate}&end=${endDate}`;
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};

export const createBulkInventoryMovements = async (
  movementsData: Omit<InventoryMovement, "id" | "createdAt" | "updatedAt" | "product" | "complex">[]
): Promise<InventoryMovementResult<InventoryMovement[]>> => {
  try {
    const response = await api.post("/inventory-movements/bulk", movementsData);
    return { success: true, data: response.data };
  } catch (error) {
    return handleInventoryMovementError(error);
  }
};
