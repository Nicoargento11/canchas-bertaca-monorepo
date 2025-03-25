// frontend/services/userService.ts
import api from "../api";
import { fixedSchedule } from "../fixed-schedules/fixedSchedules";
import { Reserve } from "../reserves/reserves";

export interface User {
  id: string;
  name: string;
  email: string;
  emailVerified?: string | null;
  hashedRefreshToken?: string | null;
  image?: string | null;
  phone?: string | null;
  role: "ADMIN" | "USUARIO" | "MODERADOR";
  Reserve?: Reserve[];
  FixedSchedule?: fixedSchedule[];
  createdAt: Date;
  updatedAt: Date;
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
  console.log(response.data);
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
