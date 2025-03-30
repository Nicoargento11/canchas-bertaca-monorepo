import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Session } from "@/services/auth/session";

import { apiAuthPrefix } from "./route";
// 1. Specify protected and public routes
const protectedRoutes = ["/dashboard", "/profile"];
const publicRoutes = ["/"];

const secretKey = process.env.SESSION_SECRET_KEY;
const encodedKey = new TextEncoder().encode(secretKey);

export default async function middleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname;

  const isApiAuthRoute = req.nextUrl.pathname.startsWith(apiAuthPrefix);
  const isProtectedRoute = protectedRoutes.includes(path);
  const isPublicRoute = publicRoutes.includes(path);

  if (isApiAuthRoute) {
    return;
  }
  if (path == "/payment/succes" || path == "/payment/failure") {
    const payment = req.nextUrl.searchParams.get("external_reference");
    if (!payment) {
      return Response.redirect(new URL("/", req.nextUrl));
    }
  }
  // 3. Decrypt the session from the cookie
  const cookie = (await cookies()).get("session")?.value;

  if (!cookie && isProtectedRoute) {
    return Response.redirect(new URL("/", req.nextUrl));
  }
  if (!cookie && isPublicRoute) {
    return NextResponse.next();
  }

  const { payload: session } = await jwtVerify<Session>(cookie!, encodedKey, {
    algorithms: ["HS256"],
  });
  if (!session.user.id && isProtectedRoute) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
