"use server";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { ROLES, UserRole } from "@/lib/roles";

const secretKey = process.env.SESSION_SECRET_KEY;
if (!secretKey) throw new Error("SESSION_SECRET no está definido");

const encodedKey = new TextEncoder().encode(secretKey);
const cookieName = "auth-session";

export type SessionPayload = {
  user: {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    phone: string | null;
    complexId?: string | null;
    complexSlug?: string | null;
  };
  accessToken: string;
};

const SESSION_DURATION_MS = 365 * 24 * 60 * 60 * 1000; // 365 días

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(encodedKey);
}

export async function decrypt(session: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify<SessionPayload & JWTPayload>(session, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    console.error("Error al verificar la sesión:", error);
    return null;
  }
}

export async function createSession(payload: SessionPayload): Promise<void> {
  const session = await encrypt(payload);
  (await cookies()).set(cookieName, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_MS / 1000,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const session = (await cookies()).get(cookieName)?.value;
  return session ? decrypt(session) : null;
}

export async function updateSession(updates: Partial<SessionPayload>): Promise<void> {
  const currentSession = await getSession();
  if (!currentSession) throw new Error("No hay sesión activa");
  await createSession({ ...currentSession, ...updates });
}

export async function deleteSession() {
  (await cookies()).delete(cookieName);
}
