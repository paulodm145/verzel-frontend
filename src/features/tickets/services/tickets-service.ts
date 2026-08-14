/**
 * Serviço de ingressos. `getMine` fala com `/api/v/tickets/mine` (sessão
 * `CUSTOMER` exigida, via `httpClient` normal). `getByCode` fala com
 * `/api/tickets/:code` — o passthrough público em `app/api/tickets/[code]`,
 * não `httpClient` — porque a página `/ticket/[code]` precisa funcionar sem
 * sessão nenhuma, e `httpClient` (baseURL `/api/v`) redireciona pro login em
 * qualquer 401, o que o proxy genérico devolveria sempre por faltar cookie.
 */
import axios from "axios";

import { isApiError, parseApiError } from "@/lib/api-errors";
import { httpClient } from "@/lib/http-client";

import type { MyTicketsParams, PublicTicket, TicketsPage } from "../types";

const DEFAULT_TAKE = 20;

const publicClient = axios.create();

publicClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error) && error.response) {
      throw parseApiError(error.response.status, error.response.data);
    }
    throw error;
  },
);

export const ticketsService = {
  async getMine(params: MyTicketsParams = {}): Promise<TicketsPage> {
    const { data } = await httpClient.get<TicketsPage>("/tickets/mine", {
      params: { skip: params.skip ?? 0, take: params.take ?? DEFAULT_TAKE },
    });
    return data;
  },

  /** `null` para código inexistente — 404 é o estado normal de "link errado
   * ou expirado", não uma falha a propagar como erro genérico. */
  async getByCode(code: string): Promise<PublicTicket | null> {
    try {
      const { data } = await publicClient.get<PublicTicket>(
        `/api/tickets/${encodeURIComponent(code)}`,
      );
      return data;
    } catch (error) {
      if (isApiError(error) && error.status === 404) return null;
      throw error;
    }
  },
};
