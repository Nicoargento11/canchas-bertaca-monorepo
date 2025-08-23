import api from "../api";
import axios from "axios";

export type SportTypeKey =
  | "FUTBOL_5"
  | "FUTBOL_7"
  | "FUTBOL_11"
  | "PADEL"
  | "TENIS"
  | "BASKET"
  | "VOLEY"
  | "HOCKEY";

export type SportType = {
  id: string;
  name: SportTypeKey;
  description: string | null;
  complexId: string;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type QuerySportType = {
  isActive?: boolean;
  search?: string;
};

export type SportTypeResult<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
};

interface GenericError {
  status?: number;
  message?: string;
  data?: any;
}

const handleSportTypeError = (error: unknown): SportTypeResult => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message || "Error en la solicitud";

      if (status === 401) return { success: false, error: message || "No autorizado" };
      if (status === 403)
        return { success: false, error: message || "No tiene permisos para esta acción" };
      if (status === 404)
        return { success: false, error: message || "Tipo de deporte no encontrado" };
      if (status === 409)
        return { success: false, error: message || "Conflicto con los datos proporcionados" };
      if (status === 400)
        return { success: false, error: error.response.data?.message || "Datos inválidos" };

      return { success: false, error: message };
    }
    return { success: false, error: "Error de conexión" };
  }

  const genericError = error as GenericError;
  if (genericError.status && genericError.message) {
    return {
      success: false,
      error: genericError.message || `Error ${genericError.status}`,
    };
  }

  return {
    success: false,
    error: error instanceof Error ? error.message : "Error desconocido",
  };
};

export const createSportType = async (data: {
  name: SportTypeKey;
  complexId: string;
}): Promise<SportTypeResult<SportType>> => {
  try {
    const response = await api.post("/sport-types", data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleSportTypeError(error);
  }
};

export const getAllSportTypes = async (
  query?: QuerySportType
): Promise<SportTypeResult<SportType[]>> => {
  try {
    const response = await api.get("/sport-types", { params: query });
    return { success: true, data: response.data };
  } catch (error) {
    return handleSportTypeError(error);
  }
};

export const getSportTypeById = async (id: string): Promise<SportTypeResult<SportType>> => {
  try {
    const response = await api.get(`/sport-types/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleSportTypeError(error);
  }
};

export const updateSportTypeFetch = async (
  id: string,
  data: { name?: string; key?: SportTypeKey }
): Promise<SportTypeResult<SportType>> => {
  try {
    const response = await api.patch(`/sport-types/${id}`, data);
    return { success: true, data: response.data };
  } catch (error) {
    return handleSportTypeError(error);
  }
};

export const deleteSportTypeFetch = async (id: string): Promise<SportTypeResult> => {
  try {
    const response = await api.delete(`/sport-types/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleSportTypeError(error);
  }
};

export const toggleSportTypeStatusFetch = async (
  id: string
): Promise<SportTypeResult<SportType>> => {
  try {
    const response = await api.patch(`/sport-types/${id}/toggle-status`);
    return { success: true, data: response.data };
  } catch (error) {
    return handleSportTypeError(error);
  }
};

// Helper para formatear los nombres de los tipos de deporte
export const formatSportTypeName = (key: SportTypeKey): string => {
  const sportNames: Record<SportTypeKey, string> = {
    FUTBOL_5: "Fútbol 5",
    FUTBOL_7: "Fútbol 7",
    FUTBOL_11: "Fútbol 11",
    PADEL: "Pádel",
    TENIS: "Tenis",
    BASKET: "Básquet",
    VOLEY: "Vóley",
    HOCKEY: "Hockey",
  };

  return sportNames[key] || key;
};

// Helper para obtener opciones de tipos de deporte para selects
// export const getSportTypeOptions = (sportTypes: SportType[]) => {
//   return sportTypes.map(sport => ({
//     value: sport.id,
//     label: formatSportTypeName(sport.key),
//     originalKey: sport.key
//   }));
// };
