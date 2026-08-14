/**
 * Cliente HTTP do browser para dados (spec seção 2.6). Fala só com
 * `/api/v/*`, a própria origem — sem lógica de token nenhuma aqui, porque
 * renovar sessão é responsabilidade exclusiva do servidor (`server/proxy.ts`).
 * Cookies vão junto automaticamente por ser mesma origem, sem precisar de
 * `withCredentials`.
 */
import axios, { AxiosError } from "axios";

import { parseApiError } from "./api-errors";

export const httpClient = axios.create({
  baseURL: "/api/v",
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const apiError = parseApiError(error.response.status, error.response.data);

      // 401 aqui significa que o proxy já tentou renovar e não conseguiu —
      // a sessão realmente acabou. Manda para o login. Precisa ser um hard
      // redirect: um interceptor do axios roda fora do ciclo de
      // render/eventos do React, então `useRouter()` não está disponível.
      if (apiError.status === 401 && typeof window !== "undefined") {
        // eslint-disable-next-line @next/next/no-location-assign-relative-destination -- fora de componente React, useRouter() não existe aqui.
        window.location.assign("/login");
      }

      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  },
);
