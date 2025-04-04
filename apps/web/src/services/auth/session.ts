"use server";
import { jwtVerify, SignJWT } from "jose";
import { Role } from "../../models/type";
import { cookies } from "next/headers";

export type Session = {
  user: {
    id: string;
    name: string;
    role: Role;
    email: string;
    phone: string | null;
  };
  accessToken: string;
  refreshToken: string;
};

const secretKey = process.env.SESSION_SECRET_KEY;
const encodedKey = new TextEncoder().encode(secretKey);

export const createSession = async (payload: Session) => {
  const expiredAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7d

  const session = await new SignJWT(payload)
    .setProtectedHeader({
      alg: "HS256",
    })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(encodedKey);

  (await cookies()).set("session", session, {
    httpOnly: true,
    secure: true,
    expires: expiredAt,
    sameSite: "lax",
    path: "/",
  });
};

export async function getSession() {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify(cookie, encodedKey, {
      algorithms: ["HS256"],
    });
    console.log(payload);

    return payload as Session;
  } catch (err) {
    console.error("Failed to verify the session", err);
  }
}

export const deleteSession = async () => {
  (await cookies()).delete("session");
};

export async function updateTokens({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken?: string;
}) {
  const cookie = (await cookies()).get("session")?.value;
  if (!cookie) return null;

  const { payload } = await jwtVerify<Session>(cookie, encodedKey);

  if (!payload) throw new Error("Session not found");

  const newPayload: Session = {
    user: {
      ...payload.user,
    },
    accessToken,
    refreshToken: refreshToken || payload.refreshToken,
  };

  await createSession(newPayload);
}
