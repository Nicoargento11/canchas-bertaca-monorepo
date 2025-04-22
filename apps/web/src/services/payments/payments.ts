import { BACKEND_URL } from "@/config/constants";
import { reserveTurnSchema } from "@/schemas";
import { z } from "zod";
import { Reserve } from "../reserves/reserves";
import api from "../api";

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

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  isPartial: boolean;
  reserve?: Reserve;
  reserveId?: string;
  createdAt: Date;
}

export const createPaymentOnline = async (
  values: z.infer<typeof reserveTurnSchema>
) => {
  const validationFields = reserveTurnSchema.safeParse(values);

  if (!validationFields.success) {
    return { error: "Campos invalidos" };
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
      id: result.id,
      succes:
        "¡Exelente! tendra 20 minutos para completar su reserva mediante Mercado Pago, caso contrario se cancelara automaticamente",
    };
  } else {
    return {
      error: result.message,
    };
  }
};

export const createPayment = async (
  data: Omit<Payment, "id" | "createdAt">
): Promise<Payment> => {
  const response = await api.post("/payments", data);
  return response.data;
};

export const deletePayment = async (id: string): Promise<void> => {
  await api.delete(`/payments/${id}`);
};
