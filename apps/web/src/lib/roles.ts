// lib/roles.ts
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ORGANIZACION_ADMIN: "ORGANIZACION_ADMIN",
  COMPLEJO_ADMIN: "COMPLEJO_ADMIN",
  RECEPCION: "RECEPCION",
  COMMUNITY_MANAGER: "COMMUNITY_MANAGER",
  USUARIO: "USUARIO",
  PROVEEDOR: "PROVEEDOR",
} as const;

export type UserRole = keyof typeof ROLES;

// Jerarquía de roles (a mayor número, más privilegios)
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  USUARIO: 1,
  PROVEEDOR: 2,
  RECEPCION: 3,
  COMMUNITY_MANAGER: 4,
  COMPLEJO_ADMIN: 4,
  ORGANIZACION_ADMIN: 5,
  SUPER_ADMIN: 6,
};

// Helper functions
export function hasRequiredRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

// Para uso en interfaces de usuario
export const ROLE_LABELS: Record<UserRole, string> = {
  SUPER_ADMIN: "Super Administrador",
  ORGANIZACION_ADMIN: "Administrador de Organización",
  COMPLEJO_ADMIN: "Administrador de Complejo",
  COMMUNITY_MANAGER: "Community Manager",
  RECEPCION: "Recepción",
  USUARIO: "Usuario",
  PROVEEDOR: "Proveedor",
};
