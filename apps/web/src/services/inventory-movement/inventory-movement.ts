import api from "../api";
import { Product } from "../product/product";

export enum MovementType {
  COMPRA = "COMPRA",
  VENTA = "VENTA",
  AJUSTE = "AJUSTE",
  PERDIDA = "PERDIDA",
  DEVOLUCION = "DEVOLUCION",
}

export interface InventoryMovement {
  id: string;
  product: Product;
  productId: string;
  quantity: number;
  type: MovementType;
  reason?: string;
  documentNumber?: string;
  createdAt: string;
}

export const createMovement = async (data: {
  productId: string;
  quantity: number;
  type: MovementType;
  reason?: string;
  documentNumber?: string;
}): Promise<InventoryMovement> => {
  const response = await api.post("/inventory-movements", data);
  return response.data;
};

export const getMovementsByProduct = async (
  productId: string
): Promise<InventoryMovement[]> => {
  const response = await api.get(`/inventory-movements/product/${productId}`);
  return response.data;
};

export const getMovementById = async (
  id: string
): Promise<InventoryMovement> => {
  const response = await api.get(`/inventory-movements/${id}`);
  return response.data;
};

export const deleteMovement = async (id: string): Promise<void> => {
  await api.delete(`/inventory-movements/${id}`);
};
