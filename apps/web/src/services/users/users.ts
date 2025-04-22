// frontend/services/userService.ts
import api from "../api";
import { FixedSchedule } from "../fixed-schedules/fixedSchedules";
import { Reserve } from "../reserves/reserves";

export enum Role {
  USUARIO = "USUARIO",
  MODERADOR = "MODERADOR",
  ADMINISTRADOR = "ADMINISTRADOR",
}

export interface User {
  id: string;
  name: string;
  email?: string | null;
  emailVerified?: Date | null;
  hashedRefreshToken?: string | null;
  image?: string | null;
  password: string;
  phone?: string | null;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
  Reserve?: Reserve[];
  FixedSchedule?: FixedSchedule[];
}

export interface SendDataUser {
  name: string;
  email?: string;
  password: string;
  phone?: string;
  role?: "ADMIN" | "USUARIO" | "MODERADOR";
}

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get("/users");
  return response.data;
};

export const getUserById = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const createUser = async (data: SendDataUser): Promise<User> => {
  const response = await api.post("/users", data);
  return response.data;
};

export const updateUser = async (
  id: string,
  data: Partial<SendDataUser>
): Promise<User> => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<void> => {
  await api.delete(`/users/${id}`);
};
