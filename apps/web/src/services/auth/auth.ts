import { z } from "zod";
import api from "../api";
import axios from "axios";
import { createSession, deleteSession, updateSession } from "./session";
import { loginSchema, registerSchema } from "@/schemas/auth";

type AuthResult<T = { message?: string }> = {
  success: boolean;
  data?: T;
  error?: string;
};

const handleAxiosError = (error: unknown): AuthResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: "Credenciales inválidas" };
      if (status === 409) return { success: false, error: "El email ya está en uso" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const signUp = async (values: z.infer<typeof registerSchema>): Promise<AuthResult> => {
  const { success, data } = registerSchema.safeParse(values);
  if (!success) return { success: false, error: "Campos inválidos" };

  try {
    await api.post("/auth/register", data, {
      headers: { "Content-Type": "application/json" },
      withCredentials: true,
    });
    return { success: true, data: { message: "¡Usuario creado con éxito!" } };
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const signIn = async (values: z.infer<typeof loginSchema>): Promise<AuthResult> => {
  const { success, data } = loginSchema.safeParse(values);
  if (!success) return { success: false, error: "Campos inválidos" };

  try {
    const response = await api.post("/auth/login", data);
    const { user, access_token } = response.data;

    await createSession({
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        complexId: user.Complex?.id,
        complexSlug: user.Complex?.slug,
      },
      accessToken: access_token,
      // No almacenamos refreshToken en el cliente (se maneja por cookies)
    });

    return { success: true, data: { message: "Inicio de sesión exitoso" } };
  } catch (error) {
    return handleAxiosError(error);
  }
};

export const signOut = async (): Promise<AuthResult> => {
  try {
    await api.post("/auth/logout");
    await deleteSession();
    return { success: true };
  } catch (error) {
    await deleteSession(); // Siempre limpiamos la sesión local
    return handleAxiosError(error);
  }
};

export const refreshTokens = async (): Promise<AuthResult> => {
  try {
    const response = await api.post("/auth/refresh");

    await updateSession({
      accessToken: response.data.access_token,
      // No actualizamos refreshToken (se maneja por cookies)
    });

    return { success: true };
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await deleteSession();
      return {
        success: false,
        error: "Sesión expirada. Por favor ingresa nuevamente.",
      };
    }
    return handleAxiosError(error);
  }
};
