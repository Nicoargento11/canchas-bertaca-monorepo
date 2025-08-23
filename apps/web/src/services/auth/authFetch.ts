import { refreshTokens } from "./auth"; // Asumo que cambiarás refreshToken por refreshTokens
import { deleteSession, getSession } from "./session";

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const authFetch = async (
  url: string | URL,
  options: FetchOptions = {}
): Promise<Response> => {
  const session = await getSession();

  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${session?.accessToken}`,
  };
  let response = await fetch(url, options);
  // Manejar token expirado
  if (response.status === 401) {
    try {
      const refreshResult = await refreshTokens();

      if (refreshResult.success) {
        const newSession = await getSession();
        options.headers.Authorization = `Bearer ${newSession?.accessToken}`;
        response = await fetch(url, options);
      } else {
        await deleteSession();
        throw {
          isAuthError: true,
          message: "Session expired. Please login again.",
        };
      }
    } catch (error) {
      await deleteSession();
      throw error;
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw {
      status: response.status,
      message: errorData.message || `HTTP error! status: ${response.status}`,
      data: errorData,
    };
  }

  return response;
};
