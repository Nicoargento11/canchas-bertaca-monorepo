import api from "../api";
import { Payment } from "../payment/payment";

export enum PaymentMethod {
  EFECTIVO = "EFECTIVO",
  TARJETA_CREDITO = "TARJETA_CREDITO",
  TRANSFERENCIA = "TRANSFERENCIA",
  MERCADOPAGO = "MERCADOPAGO",
  OTRO = "OTRO",
}

export interface SaleItemDto {
  productId: string;
  quantity: number;
  price: number;
  discount?: number;
  isGift?: boolean;
}

export interface SalePaymentDto {
  method: PaymentMethod;
  amount: number;
}

export interface CreateSaleDto {
  complexId: string;
  totalAmount: number;
  createdById?: string;
  cashSessionId: string;
  items: SaleItemDto[];
  payments: SalePaymentDto[];
}

export interface Sale {
  id: string;
  totalAmount: number;
  createdAt: Date;
  complexId: string;
  createdById?: string;
  payments: Payment[];
}

export const createSale = async (data: CreateSaleDto) => {
  const response = await api.post<Sale>("/sales", data);
  return {
    success: true,
    data: response.data,
  };
};
