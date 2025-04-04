import { BACKEND_URL } from "@/config/constants";
import { createReserveAdminSchema, editReserveAdminSchema } from "@/schemas";
import { z } from "zod";

type Status = "APROBADO" | "PENDIENTE" | "RECHAZADO";
type ReserveType = "NORMAL" | "FIJO";

export type TurnByDay = {
  schedule: string;
  court: number[];
}[];

export type TurnByHour = {
  schedule: string;
  court: number[];
};

export type Reserve = {
  id: string;
  date: string;
  schedule: string;
  court: number;
  price: number;
  reservationAmount: number;
  status: Status;
  paymentUrl: string | null;
  paymentId: string | null;
  phone: string | null;
  clientName: string | null;
  reserveType: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  paymentToken: string | null;
  User?: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };
};

export type ReservesByDay = {
  schedule: string;
  court: {
    id: string;
    court: number;
    status: Status;
    price: number;
    reservationAmount: number;
    clientName: string;
    phone: string;
    reserveType: ReserveType;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
}[];

export const getAvailableTurnsByDay = async (
  date: string
): Promise<TurnByDay | null> => {
  const response = await fetch(
    `${BACKEND_URL}/reserves/available-turns-day?date=${date}`
  );
  if (response.ok) {
    const availableSchedules = await response.json();
    return availableSchedules;
  } else {
    return null;
  }
};

export const getAvailableTurnsByHour = async (
  date: string,
  schedule: string
): Promise<TurnByHour | null> => {
  const response = await fetch(
    `${BACKEND_URL}/reserves/available-turns-schedule?date=${date}&schedule=${schedule}`
  );
  if (response.ok) {
    const availableSchedules = await response.json();

    return availableSchedules;
  } else {
    return null;
  }
};

export const getReservesByDayFetch = async (
  date: string
): Promise<ReservesByDay | null> => {
  const response = await fetch(
    `${BACKEND_URL}/reserves/reserves-turns-day?date=${date}`
  );
  if (response.ok) {
    const reserves = await response.json();
    return reserves;
  } else {
    return null;
  }
};

export const getReserveByIdFetch = async (
  id: string
): Promise<Reserve | null> => {
  const response = await fetch(`${BACKEND_URL}/reserves/${id}`);
  if (response.ok) {
    const reserve = await response.json();
    return reserve;
  } else {
    return null;
  }
};

export const getAllReservesPagination = async (
  page: number,
  limit: number
): Promise<{ total: number; reserves: Reserve[] } | null> => {
  const response = await fetch(
    `${BACKEND_URL}/reserves/paginate?page=${page}&limit=${limit}`
  );
  if (response.ok) {
    const reserves = await response.json();
    return reserves;
  } else {
    return null;
  }
};

export const createReserve = async (
  values: z.infer<typeof createReserveAdminSchema>
) => {
  const validationFields = createReserveAdminSchema.safeParse(values);

  if (!validationFields.success) {
    return { error: "Campos invalidos" };
  }

  const response = await fetch(`${BACKEND_URL}/reserves/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validationFields.data),
  });

  const result = await response.json();
  if (response.ok) {
    return {
      succes: "¡Reserva creada con exito!",
    };
  } else {
    return {
      error: result.message,
    };
  }
};

export const editReserve = async (
  values: z.infer<typeof editReserveAdminSchema>
) => {
  const validationFields = editReserveAdminSchema.safeParse(values);
  if (!validationFields.success) {
    return { error: "Campos invalidos" };
  }
  const response = await fetch(`${BACKEND_URL}/reserves/${values.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validationFields.data),
  });

  const result = await response.json();
  if (response.ok) {
    return {
      succes: "¡Reserva editada con exito!",
    };
  } else {
    return {
      error: result.message,
    };
  }
};

export const deleteReserve = async (id: string) => {
  const response = await fetch(`${BACKEND_URL}/reserves/${id}`, {
    method: "DELETE",
  });
  const result = await response.json();
  if (response.ok) {
    return {
      succes: "¡Reserva eliminada con exito!",
    };
  } else {
    return {
      error: result.message,
    };
  }
};
