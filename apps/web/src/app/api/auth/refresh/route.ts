import { NextRequest, NextResponse } from "next/server";
import { getSession, updateSession, deleteSession } from "@/services/auth/session";

export async function POST(_req: NextRequest) {
  const session = await getSession();

  if (!session?.refreshToken) {
    await deleteSession();
    return NextResponse.json({ success: false, error: "No session" }, { status: 401 });
  }

  try {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
    const response = await fetch(`${backendUrl}/auth/refresh`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.refreshToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      await deleteSession();
      return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
    }

    const data = await response.json();
    await updateSession({ accessToken: data.access_token });

    return NextResponse.json({ success: true, access_token: data.access_token });
  } catch {
    await deleteSession();
    return NextResponse.json({ success: false, error: "Refresh failed" }, { status: 500 });
  }
}
