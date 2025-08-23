import { Reserve } from "../reserve/reserve";
import { z } from "zod";
import axios from "axios";
import api from "../api";
import { reserveTurnSchema } from "@/schemas/reserve";
import { ProductSale } from "../product-sale.ts/product-sale";
import { Complex } from "../complex/complex";
import { CashSession } from "../cash-session/cash-session";

export type PaymentMethod =
  | "EFECTIVO"
  | "TARJETA_CREDITO"
  | "TRANSFERENCIA"
  | "MERCADOPAGO"
  | "OTRO";

export type TransactionType =
  | "RESERVA"
  | "VENTA_PRODUCTO"
  | "SERVICIO"
  | "GASTO"
  | "ESCUELA_FUTBOL"
  | "EVENTO";

export type Payment = {
  id: string;
  amount: number;
  method: PaymentMethod;
  transactionType: TransactionType;
  isPartial: boolean;
  reserve?: Reserve | null;
  reserveId?: string | null;
  complexId?: string;
  complex?: Complex;
  cashSessionId?: string;
  CashSession?: CashSession;

  // tournamentRegistration?: TournamentRegistration | null;
  // tournamentRegistrationId?: string | null;
  productSales?: ProductSale[];
  createdAt: string;
};

type PaymentResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GenericError {
  status?: number;
  message?: string;
  data?: any;
}

const handlePaymentError = (error: unknown): PaymentResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 404) return { success: false, error: message || "Pago no encontrado" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };

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

export const createPaymentOnline = async (
  values: z.infer<typeof reserveTurnSchema>,
  complexId: string
): Promise<PaymentResult<{ id: string; success: string }>> => {
  try {
    const validationFields = reserveTurnSchema.safeParse(values);
    if (!validationFields.success) {
      return { success: false, error: "Campos inválidos" };
    }

    const response = await api.post("/payments/create", {
      ...validationFields.data,
      complexId,
      reserveType: "ONLINE",
    });
    return { success: true, data: response.data };
  } catch (error) {
    return handlePaymentError(error);
  }
};

export const createPayment = async (
  data: Omit<Payment, "id" | "createdAt">
): Promise<PaymentResult<Payment>> => {
  try {
    const response = await api.post("/payments", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handlePaymentError(error);
  }
};

export const getPayment = async (id: string): Promise<PaymentResult<Payment>> => {
  try {
    const response = await api.get(`/payments/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handlePaymentError(error);
  }
};

export const getPayments = async (): Promise<PaymentResult<Payment[]>> => {
  try {
    const response = await api.get("/payments");
    return { success: true, data: response.data };
  } catch (error) {
    return handlePaymentError(error);
  }
};

export const updatePayment = async (
  id: string,
  data: Partial<Payment>
): Promise<PaymentResult<Payment>> => {
  try {
    const response = await api.patch(`/payments/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handlePaymentError(error);
  }
};

export const deletePayment = async (id: string): Promise<PaymentResult> => {
  try {
    await api.delete(`/payments/${id}`);
    return { success: true };
  } catch (error) {
    return handlePaymentError(error);
  }
};
