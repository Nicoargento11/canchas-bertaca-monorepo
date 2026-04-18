// frontend/services/api.ts

import { BACKEND_URL } from "@/config/constants";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// --- Tipos para mayor claridad y seguridad ---

// Añadimos una propiedad personalizada a la configuración de la petición para el reintento.
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Definimos la forma de las promesas que encolaremos.
type FailedQueuePromise = {
  resolve: (value: void) => void;
  reject: (reason?: any) => void;
};

// --- Configuración de la instancia de Axios ---

const api = axios.create({
  baseURL: `${BACKEND_URL}`, // URL de tu API de NestJS
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- Lógica del Interceptor para Manejar el Refresco de Tokens ---

// Bandera para evitar múltiples llamadas de refresh simultáneas.
let isRefreshing = false;
// Cola para almacenar las peticiones que fallaron con 401 mientras se refrescaba el token.
let failedQueue: FailedQueuePromise[] = [];

// Función para procesar la cola de peticiones fallidas.
const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      // Si el refresh falló, rechazamos todas las peticiones encoladas.
      prom.reject(error);
    } else {
      // Si el refresh fue exitoso, resolvemos las peticiones para que se reintenten.
      prom.resolve();
    }
  });
  // Limpiamos la cola.
  failedQueue = [];
};

const AUTH_ROUTES = ["/auth/login", "/auth/register", "/auth/logout", "/auth/refresh"];

// Función para verificar si una URL es una ruta de autenticación
const isAuthRoute = (url?: string): boolean => {
  if (!url) return false;
  return AUTH_ROUTES.some((route) => url.includes(route));
};

// Interceptor de RESPUESTA. Se ejecuta después de recibir una respuesta del servidor.
api.interceptors.response.use(
  // 1. Función para respuestas exitosas (status 2xx)
  (response) => {
    // Si la respuesta es exitosa, no hacemos nada y la devolvemos tal cual.
    return response;
  },
  // 2. Función para respuestas con error
  async (error: AxiosError) => {
    // Obtenemos la configuración de la petición original que falló.
    const originalRequest = error.config as CustomInternalAxiosRequestConfig;

    // Nos interesa actuar SOLO si el error es 401 (Unauthorized)
    // y si esta petición no es ya un reintento.
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !isAuthRoute(originalRequest.url) // 👈 Esta es la línea clave
    ) {
      // Si ya hay un proceso de refresh en curso...
      if (isRefreshing) {
        return new Promise<void>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Marcamos la petición como un reintento para evitar bucles infinitos.
      originalRequest._retry = true;
      // Activamos la bandera para indicar que estamos refrescando el token.
      isRefreshing = true;

      try {
        // Hacemos la llamada al endpoint de refresh. No necesitamos enviar datos,
        // el navegador adjuntará la cookie 'refresh_token' automáticamente.
        await api.post("/auth/refresh");

        // Si la llamada fue exitosa, el backend ya nos ha enviado la nueva cookie 'access_token'.
        // Ahora procesamos la cola, resolviendo todas las promesas pendientes.
        processQueue(null);

        // Reintentamos la petición original que falló.
        return api(originalRequest);
      } catch (refreshError) {
        // Si la llamada a /auth/refresh falla (ej: refresh token expirado o inválido)...
        processQueue(refreshError as AxiosError);

        // Aquí es donde deslogueas al usuario.
        console.error("Session refresh failed. Logging out.", refreshError);
        // Podrías limpiar el estado de tu aplicación (ej: Zustand, Redux)
        // y redirigir al usuario a la página de login.
        // window.location.href = '/login';

        return Promise.reject(refreshError);
      } finally {
        // Sea cual sea el resultado, desactivamos la bandera y limpiamos la cola.
        isRefreshing = false;
      }
    }

    // Para cualquier otro error que no sea 401, simplemente lo devolvemos.
    return Promise.reject(error);
  }
);

export default api;
