"use server";

import { SessionPayload } from "@/services/auth/session";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";

type Complex = {
  id: string;
  name: string;
  slug: string;
  organizationId?: string | null;
};

export async function getAvailableComplexes(session: SessionPayload): Promise<Complex[]> {
  try {
    const userRole = session.user.role;

    // SUPER_ADMIN puede ver todos los complejos
    if (userRole === "SUPER_ADMIN") {
      const response = await fetch(`${BACKEND_URL}/complexes`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        cache: "no-store",
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data || [];
    }

    // ORGANIZACION_ADMIN puede ver los complejos de su organización
    if (userRole === "ORGANIZACION_ADMIN") {
      // Obtener información del usuario para conocer su organizationId
      const userResponse = await fetch(`${BACKEND_URL}/users/${session.user.id}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        cache: "no-store",
      });

      if (userResponse.ok) {
        const userData = await userResponse.json();
        const organizationId = userData?.organizationId;

        if (organizationId) {
          const response = await fetch(`${BACKEND_URL}/complexes`, {
            headers: {
              Authorization: `Bearer ${session.accessToken}`,
            },
            cache: "no-store",
          });

          if (!response.ok) return [];
          const allComplexes = await response.json();
          return allComplexes.filter((c: Complex) => c.organizationId === organizationId);
        }
      }
    }

    // RECEPCION, COMPLEJO_ADMIN solo ven su complejo asignado
    if (session.user.complexId) {
      const response = await fetch(`${BACKEND_URL}/complexes/${session.user.complexId}`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        cache: "no-store",
      });

      if (!response.ok) return [];
      const data = await response.json();
      return data ? [data] : [];
    }

    return [];
  } catch (error) {
    console.error("Error obteniendo complejos disponibles:", error);
    return [];
  }
}
