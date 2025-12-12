import { NextRequest, NextResponse } from "next/server";
import { getSession } from "./services/auth/session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession();

  // Si accede a /dashboard sin slug, redirigir al complejo correcto según el usuario
  if (pathname === "/dashboard" || pathname === "/dashboard/") {
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Si el usuario no tiene complexSlug asignado, redirigir al perfil o página de configuración
    if (!session.user.complexSlug) {
      return NextResponse.redirect(new URL("/profile", request.url));
    }

    return NextResponse.redirect(new URL(`/${session.user.complexSlug}/dashboard`, request.url));
  }

  // Lista de rutas protegidas (ahora incluyendo la nueva estructura)
  const protectedRoutes = ["/profile", "/super-admin"];
  const isDashboardRoute = pathname.match(/^\/[^/]+\/dashboard/);

  // Verificar si la ruta actual está protegida
  if (protectedRoutes.some((route) => pathname.startsWith(route)) || isDashboardRoute) {
    // 1. Validar sesión (para cualquier ruta protegida)
    if (!session) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // 2. Validar acceso al dashboard (para rutas /{slug}/dashboard)
    if (isDashboardRoute) {
      const slugMatch = pathname.match(/^\/([^/]+)\/dashboard/);
      const requestedSlug = slugMatch?.[1];

      // Validar según el rol
      if (session.user.role === "RECEPCION" || session.user.role === "COMPLEJO_ADMIN") {
        // Solo puede acceder a su complejo asignado
        if (session.user.complexSlug && requestedSlug !== session.user.complexSlug) {
          return NextResponse.redirect(
            new URL(`/${session.user.complexSlug}/dashboard`, request.url)
          );
        }
      }
      // ORGANIZACION_ADMIN y SUPER_ADMIN pueden acceder a cualquier complejo
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
