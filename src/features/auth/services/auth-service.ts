/**
 * Serviço de autenticação. Fala com `/api/auth/*`, não `/api/v/*` — são
 * rotas de sessão do BFF, fora do prefixo do proxy genérico de dados (spec
 * seção 2.5). Por isso usa um cliente axios próprio em vez de
 * `lib/http-client.ts`: aquele tem `baseURL: "/api/v"` e redireciona para
 * `/login` em qualquer 401, o que quebraria justamente a tela de login
 * (onde 401 significa "credenciais erradas", não "sessão expirada").
 */
import axios from "axios";

import { isApiError, parseApiError } from "@/lib/api-errors";

import type { LoginInput, RegisterInput, SessionUser } from "../types";

const authClient = axios.create();

authClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response) {
      throw parseApiError(error.response.status, error.response.data);
    }
    throw error;
  },
);

export const authService = {
  async login(input: LoginInput): Promise<{ user: SessionUser }> {
    const { data } = await authClient.post<{ user: SessionUser }>("/api/auth/login", input);
    return data;
  },

  async register(input: RegisterInput): Promise<{ user: SessionUser }> {
    const { data } = await authClient.post<{ user: SessionUser }>("/api/auth/register", input);
    return data;
  },

  async logout(): Promise<void> {
    await authClient.post("/api/auth/logout");
  },

  /** Reidratação no boot. `null` quando não há sessão — não é um erro a
   * propagar, é o estado normal de visitante não logado. */
  async session(): Promise<SessionUser | null> {
    try {
      const { data } = await authClient.get<{ user: SessionUser }>("/api/auth/session");
      return data.user;
    } catch (error) {
      if (isApiError(error) && error.status === 401) return null;
      throw error;
    }
  },
};
