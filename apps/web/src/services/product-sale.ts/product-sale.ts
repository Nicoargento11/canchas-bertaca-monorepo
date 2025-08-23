import api from "../api";
import axios, { AxiosError } from "axios";
import { Payment } from "../payment/payment";
import { Complex } from "../complex/complex";
import { Product } from "../product/product";

export type ProductSale = {
  id: string;
  reserveId?: string;
  quantity: number;
  price: number;
  discount?: number;
  isGift: boolean;
  product: Product;
  productId: string;
  payment: Payment;
  paymentId: string;
  complex: Complex;
  complexId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductSaleResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GenericError {
  status?: number;
  message?: string;
  data?: any;
}

const handleProductSaleError = (error: unknown): ProductSaleResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 403)
        return { success: false, error: message || "No tiene permisos para esta acción" };
      if (status === 404)
        return { success: false, error: message || "Venta de producto no encontrada" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };
      if (status === 400) return { success: false, error: message || "Datos inválidos" };
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

export const createProductSale = async (data: any): Promise<ProductSaleResult<ProductSale>> => {
  try {
    const response = await api.post("/product-sales", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductSaleError(error);
  }
};

export const getAllProductSales = async (): Promise<ProductSaleResult<ProductSale[]>> => {
  try {
    const response = await api.get("/product-sales");
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductSaleError(error);
  }
};

export const getPaginatedProductSales = async (
  page = 1,
  limit = 10
): Promise<ProductSaleResult<ProductSale[]>> => {
  try {
    const response = await api.get(`/product-sales/paginate?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductSaleError(error);
  }
};

export const getProductSaleById = async (id: string): Promise<ProductSaleResult<ProductSale>> => {
  try {
    const response = await api.get(`/product-sales/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductSaleError(error);
  }
};

export const getProductSalesByPayment = async (
  paymentId: string
): Promise<ProductSaleResult<ProductSale[]>> => {
  try {
    const response = await api.get(`/product-sales/by-payment/${paymentId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductSaleError(error);
  }
};

export const updateProductSale = async (
  id: string,
  data: any
): Promise<ProductSaleResult<ProductSale>> => {
  try {
    const response = await api.patch(`/product-sales/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductSaleError(error);
  }
};

export const deleteProductSale = async (id: string): Promise<ProductSaleResult> => {
  try {
    const response = await api.delete(`/product-sales/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductSaleError(error);
  }
};

export const createBulkProductSales = async (
  salesData: any[]
): Promise<ProductSaleResult<ProductSale[]>> => {
  try {
    const response = await api.post("/product-sales/bulk", salesData);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductSaleError(error);
  }
};

export const getProductSalesByDateRange = async (
  startDate: string,
  endDate: string,
  complexId?: string
): Promise<ProductSaleResult<ProductSale[]>> => {
  try {
    const url = complexId
      ? `/product-sales/by-date?start=${startDate}&end=${endDate}&complexId=${complexId}`
      : `/product-sales/by-date?start=${startDate}&end=${endDate}`;
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductSaleError(error);
  }
};

export const getProductSalesByProduct = async (
  productId: string,
  startDate?: string,
  endDate?: string
): Promise<ProductSaleResult<ProductSale[]>> => {
  try {
    const url =
      startDate && endDate
        ? `/product-sales/by-product/${productId}?start=${startDate}&end=${endDate}`
        : `/product-sales/by-product/${productId}`;
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductSaleError(error);
  }
};
