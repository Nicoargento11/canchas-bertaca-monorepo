import { reserveTurnSchema } from "@/schemas";
import { z } from "zod";
import axios from "axios";
import { authFetch } from "../auth/authFetch";
import { Reserve } from "../reserves/reserves";
import api from "../api";
import { BACKEND_URL } from "@/config/constants";

export enum PaymentMethod {
  EFECTIVO = "EFECTIVO",
  TARJETA_CREDITO = "TARJETA_CREDITO",
  TRANSFERENCIA = "TRANSFERENCIA",
  MERCADOPAGO = "MERCADOPAGO",
  OTRO = "OTRO",
}

export enum TipoTransaccion {
  RESERVA = "RESERVA",
  VENTA_PRODUCTO = "VENTA_PRODUCTO",
  SERVICIO = "SERVICIO",
  GASTO = "GASTO",
  ESCUELA_FUTBOL = "ESCUELA_FUTBOL",
  EVENTO = "EVENTO",
}

export type Payment = {
  id: string;
  amount: number;
  method: PaymentMethod;
  isPartial: boolean;
  reserve?: Reserve;
  reserveId?: string;
  createdAt: string;
};

type PaymentResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

const handlePaymentError = (error: unknown): PaymentResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: "No autorizado" };
      if (status === 404)
        return { success: false, error: "Pago no encontrado" };
      if (status === 409)
        return {
          success: false,
          error: "Conflicto con los datos proporcionados",
        };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const createPaymentOnline = async (
  values: z.infer<typeof reserveTurnSchema>
): Promise<PaymentResult<{ id: string; success: string }>> => {
  try {
    const validationFields = reserveTurnSchema.safeParse(values);
    if (!validationFields.success) {
      return { success: false, error: "Campos inválidos" };
    }

    const response = await fetch(`${BACKEND_URL}/payments/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validationFields.data),
    });

    const result = await response.json();

    if (response.ok) {
      return {
        success: true,
        data: {
          id: result.id,
          success:
            "¡Excelente! Tendrá 20 minutos para completar su reserva mediante Mercado Pago, caso contrario se cancelará automáticamente",
        },
      };
    } else {
      return { success: false, error: result.message };
    }
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

export const getPayment = async (
  id: string
): Promise<PaymentResult<Payment>> => {
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
    const response = await authFetch(`${BACKEND_URL}/payments/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
    });
    const responseData = await response.json();
    return { success: true, data: responseData };
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
