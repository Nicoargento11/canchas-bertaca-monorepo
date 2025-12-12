import axios from "axios";
import api from "../api";

type OrganizationResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Organization = {
  id: string;
  name: string;
  description?: string | null;
  type: string;
  logo?: string | null;
  website?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users?: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
  _count?: {
    complexes: number;
    users: number;
  };
};

const handleOrganizationError = (error: unknown): OrganizationResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: "No autorizado" };
      if (status === 403) return { success: false, error: "No tiene permisos" };
      if (status === 404) return { success: false, error: "Organización no encontrada" };
      if (status === 409) return { success: false, error: "La organización ya existe" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const createOrganization = async (data: {
  name: string;
  description?: string;
}): Promise<OrganizationResult<Organization>> => {
  try {
    const response = await api.post(`/organizations`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleOrganizationError(error);
  }
};

export const getOrganizations = async (): Promise<OrganizationResult<Organization[]>> => {
  try {
    const response = await api.get(`/organizations`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleOrganizationError(error);
  }
};

export const getOrganizationById = async (
  id: string
): Promise<OrganizationResult<Organization>> => {
  try {
    const response = await api.get(`/organizations/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleOrganizationError(error);
  }
};

export const updateOrganization = async (
  id: string,
  data: { name?: string; description?: string }
): Promise<OrganizationResult<Organization>> => {
  try {
    const response = await api.patch(`/organizations/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleOrganizationError(error);
  }
};

export const deleteOrganization = async (id: string): Promise<OrganizationResult> => {
  try {
    const response = await api.delete(`/organizations/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleOrganizationError(error);
  }
};
