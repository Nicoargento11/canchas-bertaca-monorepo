import axios from "axios";
import api from "../api";
import { Complex } from "../complex/complex";
import { FixedReserve } from "../fixed-reserve/fixed-reserve";
import { Organization } from "../organization/organization";
import { Reserve } from "../reserve/reserve";

type UserResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Role =
  | "SUPER_ADMIN"
  | "ORGANIZACION_ADMIN"
  | "COMPLEJO_ADMIN"
  | "RECEPCION"
  | "USUARIO";

export type User = {
  id: string;
  name: string;
  email: string;
  emailVerified?: string | null;
  password: string;
  hashedRefreshToken?: string | null;
  image?: string | null;
  phone?: string | null;
  role: Role;
  reserves: Reserve[];
  fixedSchedules: FixedReserve[];
  // Notification: Notification[];
  // Post: Post[];
  // tournamentRegistrations: TournamentRegistration[];
  Organization?: Organization | null;
  organizationId?: string | null;
  Complex?: Complex | null;
  complexId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export interface SendDataUser {
  name: string;
  email?: string;
  password: string;
  phone?: string;
  role?: "ADMIN" | "USUARIO" | "MODERADOR";
}
const handleUserError = (error: unknown): UserResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: "No autorizado" };
      if (status === 403) return { success: false, error: "No tiene permisos" };
      if (status === 404) return { success: false, error: "Usuario no encontrado" };
      if (status === 409) return { success: false, error: "El email ya está registrado" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const createUser = async (data: any): Promise<UserResult<User>> => {
  try {
    const response = await api.post(`/users`, data);

    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};

export const getUsers = async (): Promise<UserResult<User[]>> => {

  try {
    const response = await api.get(`/users`);


    return { success: true, data: response.data };
  } catch (error) {

    return handleUserError(error);
  }
};

export const getUserById = async (id: string): Promise<UserResult<User>> => {
  try {
    const response = await api.get(`/users/${id}`);

    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};

export const getCurrentUser = async (): Promise<UserResult<User>> => {
  try {
    const response = await api.get(`/users/me`);

    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};

export const updateUser = async (id: string, data: any): Promise<UserResult<User>> => {
  try {
    const response = await api.patch(`/users/${id}`, data);

    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};

export const updateCurrentUser = async (data: any): Promise<UserResult<User>> => {
  try {
    const response = await api.patch(`/users/me`, data);

    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};

export const deleteUser = async (id: string): Promise<UserResult> => {
  try {
    const response = await api.delete(`/users/${id}`);

    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};

export const toggleUserStatus = async (id: string): Promise<UserResult<User>> => {
  try {
    const response = await api.patch(`/users/${id}/toggle-status`);

    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};

export const changePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<UserResult> => {
  try {
    const response = await api.patch(`/users/me/password`, {
      currentPassword,
      newPassword,
    });

    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};

export const getUserByOrganization = async (
  organizationId: string,
  page = 1,
  limit = 10
): Promise<UserResult<User[]>> => {
  try {
    const response = await api.get(
      `/users/organization/${organizationId}?page=${page}&limit=${limit}`
    );
    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};

export const getUserByComplex = async (
  complexId: string,
  page = 1,
  limit = 10
): Promise<UserResult<User[]>> => {
  try {
    const response = await api.get(`/users/complex/${complexId}?page=${page}&limit=${limit}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};

export const searchUsers = async (query: string): Promise<UserResult<User[]>> => {
  try {
    const response = await api.get(`/users?search=${encodeURIComponent(query)}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleUserError(error);
  }
};
