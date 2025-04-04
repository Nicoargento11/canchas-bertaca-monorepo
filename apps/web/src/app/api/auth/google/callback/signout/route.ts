import { BACKEND_URL } from "@/config/constants";
import { authFetch } from "@/services/auth/authFetch";
import { deleteSession } from "@/services/auth/session";
import { redirect, RedirectType } from "next/navigation";

export async function GET() {
  const respone = await authFetch(`${BACKEND_URL}/auth/signout`, {
    method: "POST",
  });
  if (respone.ok) {
  }
  await deleteSession();

  redirect("/", RedirectType.push);
}
