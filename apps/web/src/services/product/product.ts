import api from "../api";
import axios, { AxiosError } from "axios";
import { Complex } from "../complex/complex";

export type ProductCategory = "BEBIDA" | "COMIDA" | "SNACK" | "EQUIPAMIENTO" | "OTRO";

export type Product = {
  id: string;
  name: string;
  description?: string;
  barcode?: string;
  category: ProductCategory;
  stock: number;
  costPrice: number;
  salePrice: number;
  minStock: number;
  supplier?: string;
  isActive: boolean;
  complex?: Complex;
  complexId: string;
  createdAt: string;
  updatedAt: string;
};

export type ProductResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GenericError {
  status?: number;
  message?: string;
  data?: any;
}

const handleProductError = (error: unknown): ProductResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 403)
        return { success: false, error: message || "No tiene permisos para esta acción" };
      if (status === 404) return { success: false, error: message || "Producto no encontrado" };
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

export const createProduct = async (data: any): Promise<ProductResult<Product>> => {
  try {
    const response = await api.post("/products", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductError(error);
  }
};

export const getAllProducts = async (): Promise<ProductResult<Product[]>> => {
  try {
    const response = await api.get("/products");
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductError(error);
  }
};

export const getPaginatedProducts = async (
  page = 1,
  limit = 10
): Promise<ProductResult<Product[]>> => {
  try {
    const response = await api.get(`/products/paginate?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductError(error);
  }
};

export const getProductById = async (id: string): Promise<ProductResult<Product>> => {
  try {
    const response = await api.get(`/products/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductError(error);
  }
};

export const getProductByBarcode = async (barcode: string): Promise<ProductResult<Product>> => {
  try {
    const response = await api.get(`/products/barcode/${barcode}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductError(error);
  }
};

export const updateProductFetch = async (
  id: string,
  data: any
): Promise<ProductResult<Product>> => {
  try {
    const response = await api.patch(`/products/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductError(error);
  }
};

export const deleteProductFetch = async (id: string): Promise<ProductResult> => {
  try {
    const response = await api.delete(`/products/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductError(error);
  }
};

export const updateProductStock = async (
  id: string,
  quantity: number
): Promise<ProductResult<Product>> => {
  try {
    const response = await api.patch(`/products/${id}/stock`, { quantity });
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductError(error);
  }
};

export const getLowStockProducts = async (
  threshold?: number
): Promise<ProductResult<Product[]>> => {
  try {
    const url = threshold ? `/products/low-stock?threshold=${threshold}` : "/products/low-stock";
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductError(error);
  }
};

export const searchProducts = async (
  query: string,
  complexId?: string
): Promise<ProductResult<Product[]>> => {
  try {
    const url = complexId
      ? `/products/search?query=${query}&complexId=${complexId}`
      : `/products/search?query=${query}`;
    const response = await api.get(url);
    return { success: true, data: response.data };
  } catch (error) {
    return handleProductError(error);
  }
};
