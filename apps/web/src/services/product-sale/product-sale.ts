import api from "../api";
import { Product } from "../product/product";
import { Reserve } from "../reserves/reserves";

export interface ProductSale {
  id: string;
  product: Product;
  productId: string;
  Reserves?: Reserve | null;
  reserveId?: string | null;
  quantity: number;
  price: number;
  discount?: number;
  isGift: boolean;
  createdAt: Date;
}

export const createSale = async (
  data: Omit<ProductSale, "id" | "createdAt" | "product" | "reserve">
): Promise<ProductSale> => {
  const response = await api.post("/product-sales", data);
  return response.data;
};

export const getSalesByReserve = async (
  reserveId: string
): Promise<ProductSale[]> => {
  const response = await api.get(`/product-sales/reserve/${reserveId}`);
  return response.data;
};

export const getSalesByProduct = async (
  productId: string
): Promise<ProductSale[]> => {
  const response = await api.get(`/product-sales/product/${productId}`);
  return response.data;
};

export const getSaleById = async (id: string): Promise<ProductSale> => {
  const response = await api.get(`/product-sales/${id}`);
  return response.data;
};

export const deleteSale = async (id: string): Promise<void> => {
  await api.delete(`/product-sales/${id}`);
};

export const getTotalSalesByReserve = async (
  reserveId: string
): Promise<number> => {
  const response = await api.get(`/product-sales/reserve/${reserveId}/total`);
  return response.data.total;
};
