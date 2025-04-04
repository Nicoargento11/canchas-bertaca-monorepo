"use server";

import { loginSchema, registerSchema } from "@/schemas";
import { z } from "zod";
import { BACKEND_URL } from "../../config/constants";
import {
  createSession,
  deleteSession,
  getSession,
  updateTokens,
} from "./session";
import { authFetch } from "./authFetch";

export const signUp = async (values: z.infer<typeof registerSchema>) => {
  const validationFields = registerSchema.safeParse(values);

  if (!validationFields.success) {
    return { error: "Campos invalidos" };
  }
  // confirm password
  const { ...payload } = validationFields.data;

  const response = await fetch(`${BACKEND_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (response.ok) {
    return { succes: "¡Usuario creado con exito!" };
  } else {
    return {
      error:
        response.status === 409 ? "El usuario ya existe" : response.statusText,
    };
  }
};

export const signIn = async (values: z.infer<typeof loginSchema>) => {
  const validationFields = loginSchema.safeParse(values);

  if (!validationFields.success) {
    return { error: "Campos invalidos" };
  }

  const response = await fetch(`${BACKEND_URL}/auth/signin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validationFields.data),
  });

  if (response.ok) {
    const result = await response.json();

    await createSession({
      user: {
        id: result.id,
        name: result.name,
        role: result.role,
        email: result.email,
        phone: result.phone,
      },
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    });
    return { succes: "Inicio de sesion exitoso" };
  } else {
    return {
      error:
        response.status === 401
          ? "Credenciales invalidas"
          : response.statusText,
    };
  }
};

export const signOut = async () => {
  try {
    const response = await authFetch(`${BACKEND_URL}/auth/signout`, {
      method: "POST",
    });

    if (!response.ok) {
      return { error: "Error al cerrar sesión" };
    }

    await deleteSession();
    return { success: true };
  } catch {
    // console.error("Error during sign out:", error);
    return { error: "Error al cerrar sesión" };
  }
};

export const refreshToken = async (oldRefreshToken: string) => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refresh: oldRefreshToken,
      }),
    });
    if (!response.ok) {
      throw new Error("Failed to refresh token " + response.statusText);
    }

    const { accessToken, refreshToken } = await response.json();

    if (!accessToken || !refreshToken) throw new Error("Provide Tokens");

    const session = await getSession();
    if (session) {
      await updateTokens({
        accessToken,
        refreshToken: session.refreshToken, // Mantenemos el mismo refresh token
      });
    }

    await updateTokens({ accessToken, refreshToken });

    // if (!updateRes) throw new Error("Failed to update the tokens");

    return accessToken;
  } catch {
    // console.error("Refresh Token failed:", err);
    await deleteSession();
    return null;
  }
};
