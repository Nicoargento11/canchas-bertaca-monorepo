import { NextRequest, NextResponse } from "next/server";
import { refreshTokens } from "@/services/auth/auth";
import { getSession, createSession, deleteSession } from "@/services/auth/session";

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    await deleteSession();
    return NextResponse.json({ success: false, error: "No session" }, { status: 401 });
  }

  const refreshResult = await refreshTokens();
  if (refreshResult.success) {
    const newSession = await getSession();
    // createSession ya setea la cookie
    return NextResponse.json({ success: true, session: newSession });
  } else {
    await deleteSession();
    return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
  }
}
