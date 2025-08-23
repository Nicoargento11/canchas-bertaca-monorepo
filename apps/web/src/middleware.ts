import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./services/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession();

  // Lista de rutas protegidas
  const protectedRoutes = ["/dashboard", "/profile"];

  // Verificar si la ruta actual está protegida
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    // 1. Validar sesión (para cualquier ruta protegida)
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Validar acceso al dashboard (solo para /dashboard)
    if (pathname.startsWith("/dashboard") && !session.user.complexId) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
