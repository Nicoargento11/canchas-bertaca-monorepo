import api from "../api";
import axios, { AxiosError } from "axios";
import { User } from "../user/user";
import { Court } from "../court/court";
import { FixedReserve } from "../fixed-reserve/fixed-reserve";
import { Complex } from "../complex/complex";
import { Payment } from "../payment/payment";
import { Rate } from "../rate/rate";

export type ReserveType = "MANUAL" | "FIJO" | "ONLINE" | "TORNEO" | "ESCUELA" | "EVENTO" | "OTRO";

export type Status = "APROBADO" | "PENDIENTE" | "RECHAZADO" | "CANCELADO" | "COMPLETADO";

export type Reserve = {
  id: string;
  date: string;
  schedule: string;
  price: number;
  reservationAmount: number;
  status: Status;
  phone: string;
  clientName: string;
  reserveType: ReserveType | null;
  paymentUrl?: string | null;
  paymentIdExt?: string | null;
  paymentToken?: string | null;
  court: Court;
  courtId: string;
  user: User;
  userId: string;
  fixedReserve?: FixedReserve | null;
  fixedReserveId?: string | null;
  complex?: Complex;
  complexId: string;
  payment: Payment[];
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
};

export type ReserveResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GenericError {
  status?: number;
  message?: string;
  data?: any;
}

const handleReserveError = (error: unknown): ReserveResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 403)
        return { success: false, error: message || "No tiene permisos para esta acción" };
      if (status === 404) return { success: false, error: message || "Reserva no encontrada" };
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

export const createReserve = async (data: any): Promise<ReserveResult<Reserve>> => {
  try {
    const response = await api.post("/reserves", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};

export const getAllReserves = async (): Promise<ReserveResult<Reserve[]>> => {
  try {
    const response = await api.get("/reserves");
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};

export const getPaginatedReserves = async (
  page = 1,
  limit = 10,
  complexId?: string
): Promise<ReserveResult<{ total: number; reserves: Reserve[] }>> => {
  try {
    const complexParam = complexId ? `&complexId=${complexId}` : "";
    const response = await api.get(`/reserves/paginate?page=${page}&limit=${limit}${complexParam}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};

export const getReserveById = async (id: string): Promise<ReserveResult<Reserve>> => {
  try {
    const response = await api.get(`/reserves/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};

export const updateReserve = async (id: string, data: any): Promise<ReserveResult<Reserve>> => {
  try {
    const response = await api.patch(`/reserves/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};

// quiero una funcion para actualizar el estado de una reserva
export const updateReserveStatus = async (
  id: string,
  status: Status
): Promise<ReserveResult<Reserve>> => {
  try {
    const response = await api.patch(`/reserves/${id}/status`, { status });
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};

export const deleteReserve = async (id: string): Promise<ReserveResult> => {
  try {
    const response = await api.delete(`/reserves/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};

export const getAvailableSchedulesByDay = async (
  date: string,
  complexId: string,
  sportTypeId: string
): Promise<ReserveResult> => {
  try {
    const response = await api.get(
      `/reserves/by-day/schedules?date=${date}&complexId=${complexId}&sportTypeId=${sportTypeId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};
export type ReservesByDay = {
  schedule: string;
  court: Reserve[];
  courtInfo: { courts: CourtInfo[]; rates: Rate[] };
}[];

type CourtInfo = { courtId: string } & { rates: Rate[] };

export const getReservationsByDay = async (
  date: string,
  complexId: string,
  sportTypeId?: string
): Promise<ReserveResult<ReservesByDay>> => {
  try {
    const response = await api.get(
      `/reserves/by-day/reservations?date=${date}&complexId=${complexId}&sportTypeId=${sportTypeId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};

export type TurnByHour = {
  schedule: string;
  court: Court[];
};
export const getAvailabilityForSchedule = async (
  date: string,
  schedule: string,
  complexId: string,
  sportTypeId: string
): Promise<ReserveResult<TurnByHour>> => {
  try {
    const response = await api.get(
      `/reserves/availability/schedule?date=${date}&schedule=${schedule}&complexId=${complexId}&sportTypeId=${sportTypeId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};

export type TurnByDay = {
  schedule: string;
  court: Court[];
}[];
export const getDailyAvailability = async (
  date: string,
  complexId: string,
  sportTypeId: string
): Promise<ReserveResult<TurnByDay>> => {
  try {
    const response = await api.get(
      `/reserves/availability/daily?date=${date}&complexId=${complexId}&sportTypeId=${sportTypeId}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleReserveError(error);
  }
};
