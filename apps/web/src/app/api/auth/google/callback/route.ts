import { createSession } from "@/services/auth/session";
import { Role } from "@/models/type";
import { redirect } from "next/navigation";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const userId = searchParams.get("userId");
  const name = searchParams.get("name");
  const role = searchParams.get("role");
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");

  if (!accessToken || !refreshToken || !userId || !name || !role || !email)
    throw new Error("Google Ouath Failed!");
  await createSession({
    user: {
      id: userId,
      name: name,
      role: role as Role,
      email,
      phone,
    },
    accessToken,
    refreshToken,
  });

  redirect("/");
}
