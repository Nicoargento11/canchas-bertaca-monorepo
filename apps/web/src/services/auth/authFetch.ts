import { refreshToken } from "./auth";
import { getSession } from "./session";

export interface FetchOptions extends RequestInit {
  headers?: Record<string, string>;
}

export const authFetch = async (
  url: string | URL,
  options: FetchOptions = {}
) => {
  const session = await getSession();
  console.log(session);
  options.headers = {
    ...options.headers,
    Authorization: `Bearer ${session?.accessToken}`,
  };
  console.log(options);
  let response = await fetch(url, options);
  console.log(response);
  if (response.status === 401) {
    if (!session?.refreshToken) throw new Error("refresh token not found!");

    const newAccessToken = await refreshToken(session.refreshToken);

    if (newAccessToken) {
      options.headers.Authorization = `Bearer ${newAccessToken}`;
      response = await fetch(url, options);
    }
  }
  console.log(response);
  return response;
};
