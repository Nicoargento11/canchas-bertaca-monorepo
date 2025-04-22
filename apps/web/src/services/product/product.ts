// frontend/services/productService.ts
import api from "../api";
import { ProductSale } from "../product-sale/product-sale";

export enum ProductCategory {
  BEBIDA = "BEBIDA",
  COMIDA = "COMIDA",
  SNACK = "SNACK",
  EQUIPAMIENTO = "EQUIPAMIENTO",
  OTRO = "OTRO",
}

export enum MovementType {
  COMPRA = "COMPRA",
  VENTA = "VENTA",
  AJUSTE = "AJUSTE",
  PERDIDA = "PERDIDA",
  DEVOLUCION = "DEVOLUCION",
}

export interface ProductFormValues {
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
}

export interface InventoryMovement {
  id: string;
  product: Product;
  productId: string;
  quantity: number;
  type: MovementType;
  reason?: string | null;
  documentNumber?: string | null;
  createdAt: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  barcode?: string | null;
  category: ProductCategory;
  stock: number;
  costPrice: number;
  salePrice: number;
  minStock: number;
  supplier?: string | null;
  isActive: boolean;
  sales?: ProductSale[];
  movements?: InventoryMovement[];
}

export const getProducts = async (): Promise<Product[]> => {
  const response = await api.get("/products");
  return response.data;
};

export const getProductById = async (id: string): Promise<Product> => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (
  data: ProductFormValues
): Promise<Product> => {
  const response = await api.post("/products", data);
  return response.data;
};

export const updateProduct = async (
  id: string,
  data: Partial<ProductFormValues>
): Promise<Product> => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

export const updateStock = async (
  id: string,
  quantity: number,
  type: "increment" | "decrement" | "set"
): Promise<Product> => {
  const response = await api.patch(`/products/${id}/stock`, {
    quantity,
    type,
  });
  return response.data;
};
