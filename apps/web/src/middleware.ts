import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { Session } from "@/services/auth/session";

const apiAuthPrefix = "/api/auth";
const protectedRoutes = ["/dashboard", "/profile"];
const publicRoutes = ["/"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const secretKey = process.env.SESSION_SECRET_KEY;

  // 1. Verificar si es una ruta de API de autenticación
  if (path.startsWith(apiAuthPrefix)) {
    return NextResponse.next();
  }

  // 2. Manejar rutas de pago
  if (path === "/payment/success" || path === "/payment/failure") {
    const payment = req.nextUrl.searchParams.get("external_reference");
    if (!payment) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // 3. Obtener la cookie de sesión
  const cookie = (await cookies()).get("session")?.value;

  // 4. Manejar rutas públicas
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  // 5. Verificar sesión para rutas protegidas
  if (protectedRoutes.some((route) => path.startsWith(route))) {
    if (!cookie) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const encodedKey = new TextEncoder().encode(secretKey);
      const { payload: session } = await jwtVerify(cookie, encodedKey, {
        algorithms: ["HS256"],
      });

      if (!(session as Session).user?.id) {
        return NextResponse.redirect(new URL("/login", req.url));
      }

      // Puedes agregar información de sesión a los headers si es necesario
      const response = NextResponse.next();
      response.headers.set("x-user-id", (session as Session).user.id);
      return response;
    } catch (error) {
      console.error("JWT verification failed:", error);
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.delete("session");
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
