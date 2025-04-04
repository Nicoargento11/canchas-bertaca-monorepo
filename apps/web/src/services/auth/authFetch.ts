import { refreshToken } from "./auth";
import { deleteSession, getSession } from "./session";

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const authFetch = async (
  url: string | URL,
  options: FetchOptions = {}
) => {
  const session = await getSession();
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${session?.accessToken}`,
  };
  let response = await fetch(url, options);
  if (response.status === 401) {
    try {
      if (!session?.refreshToken) throw new Error("refresh token not found!");

      const newAccessToken = await refreshToken(session.refreshToken);
      if (newAccessToken) {
        options.headers.Authorization = `Bearer ${newAccessToken}`;
        response = await fetch(url, options);
      }
    } catch (error) {
      await deleteSession();
      throw error;
    }
  }
  return response;
};
