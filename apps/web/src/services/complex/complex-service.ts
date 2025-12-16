import axios from "axios";
import api from "../api";

type ComplexResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

export type Complex = {
  id: string;
  name: string;
  address: string;
  slug: string;
  email?: string | null;
  services: string[];
  isActive: boolean;
  organizationId?: string | null;
  organization?: {
    name: string;
  };
  managers?: {
    id: string;
    name: string;
    email: string;
    role: string;
  }[];
  _count?: {
    courts: number;
  };
  createdAt: string;
  updatedAt: string;
};

const handleComplexError = (error: unknown): ComplexResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: "No autorizado" };
      if (status === 403) return { success: false, error: "No tiene permisos" };
      if (status === 404) return { success: false, error: "Complejo no encontrado" };
      if (status === 409) return { success: false, error: "El complejo ya existe" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }
  return { success: false, error: "Error desconocido" };
};

export const createComplex = async (data: {
  name: string;
  address: string;
  organizationId?: string;
  email?: string;
  slug?: string;
  services?: string[];
}): Promise<ComplexResult<Complex>> => {
  try {
    const response = await api.post(`/complexes`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const getComplexes = async (): Promise<ComplexResult<Complex[]>> => {
  try {
    // Add timestamp to prevent caching
    const response = await api.get(`/complexes?_t=${Date.now()}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const getComplexById = async (id: string): Promise<ComplexResult<Complex>> => {
  try {
    const response = await api.get(`/complexes/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const updateComplex = async (
  id: string,
  data: {
    name?: string;
    address?: string;
    organizationId?: string;
    email?: string;
    slug?: string;
    services?: string[];
  }
): Promise<ComplexResult<Complex>> => {
  try {
    const response = await api.patch(`/complexes/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};

export const deleteComplex = async (id: string): Promise<ComplexResult> => {
  try {
    const response = await api.delete(`/complexes/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleComplexError(error);
  }
};
