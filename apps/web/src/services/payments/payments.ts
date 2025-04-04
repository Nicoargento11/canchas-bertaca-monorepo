import { BACKEND_URL } from "@/config/constants";
import { reserveTurnSchema } from "@/schemas";
import { z } from "zod";

export const createPayment = async (
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
