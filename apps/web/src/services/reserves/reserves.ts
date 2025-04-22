import { BACKEND_URL } from "@/config/constants";
import { createReserveAdminSchema, editReserveAdminSchema } from "@/schemas";
import { z } from "zod";
import { Payment } from "../payments/payments";
import { Schedule } from "../schedule/schedule";
import { FixedSchedule } from "../fixed-schedules/fixedSchedules";
import { User } from "../users/users";
import api from "../api";
import { ProductSale } from "../product-sale/product-sale";

// type Status = "APROBADO" | "PENDIENTE" | "RECHAZADO";
// type ReserveType = "NORMAL" | "FIJO";

export enum Status {
  PENDIENTE = "PENDIENTE",
  APROBADO = "APROBADO",
  RECHAZADO = "RECHAZADO",
}

export enum ReserveType {
  NORMAL = "NORMAL",
  FIJO = "FIJO",
}

export type TurnByDay = {
  schedule: string;
  court: number[];
}[];

export type TurnByHour = {
  schedule: string;
  court: number[];
};
export interface Reserve {
  id: string;
  date: Date;
  schedule: string;
  court: number;
  price?: number;
  reservationAmount?: number | null;
  status: Status;
  paymentUrl?: string | null;
  paymentId?: string | null;
  phone?: string | null;
  clientName?: string | null;
  reserveType?: ReserveType | null;
  User?: User;
  userId: string;
  paymentToken?: string | null;
  FixedSchedule?: FixedSchedule | null;
  fixedScheduleId?: string | null;
  Payment?: Payment[];
  consumitions?: ProductSale[];
  createdAt: Date;
  updatedAt: Date;
}

export type ReservesByDay = {
  schedule: string;
  court: Reserve[];
}[];

// Complete the FixedSchedule interface

// Complete your existing interfaces with the new model details
export interface ScheduleDay {
  id: string;
  dayOfWeek: number; // 0 = Sunday, ..., 6 = Saturday
  isActive: boolean;
  schedules?: Schedule[];
  FixedSchedule?: FixedSchedule[];
}

// Update your existing Schedule interface to include complete relations

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

export const getReservesByDayNoTransform = async (
  date: string
): Promise<Reserve[] | null> => {
  const response = await fetch(`${BACKEND_URL}/reserves/by-day?date=${date}`);
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

  const result: Reserve = await response.json();
  console.log(result);
  if (response.ok) {
    return {
      succes: "¡Reserva creada con exito!",
      reserve: result,
    };
  } else {
    return {
      error: "Ha ocurrido un error inesperado",
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

export const updateReserve = async (
  id: string,
  data: Partial<Reserve>
): Promise<Reserve> => {
  const response = await api.patch(`/reserves/${id}`, data);
  return response.data;
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
