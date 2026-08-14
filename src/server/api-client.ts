/**
 * Fala com a API de servidor para servidor — nunca é importado por código
 * que roda no browser (ver `src/server/` em docs/specs/000-fundacao-arquitetura.md,
 * seção 3). Duas camadas:
 *
 * - `apiRaw`: devolve a `Response` crua, sem parsear nem lançar. Usada pelo
 *   proxy genérico (`server/proxy.ts`), que só repassa o que a API respondeu.
 * - `apiServer`: conveniência para chamadas JSON pontuais (login, registro,
 *   refresh) — tipa o corpo em sucesso e lança `ApiError` em erro.
 */
import { parseApiError } from "@/lib/api-errors";

const API_URL = process.env.API_URL ?? "http://localhost:3000";

export interface ApiRawInit {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit;
  accessToken?: string;
}

export function apiRaw(path: string, init: ApiRawInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.accessToken) headers.set("authorization", `Bearer ${init.accessToken}`);

  return fetch(`${API_URL}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.body,
    // O BFF nunca deve servir uma resposta de API cacheada pelo Next.
    cache: "no-store",
  });
}

export interface ApiServerInit {
  method?: string;
  body?: unknown;
  accessToken?: string;
}

export async function apiServer<T>(path: string, init: ApiServerInit = {}): Promise<T> {
  const headers = new Headers();
  if (init.body !== undefined) headers.set("content-type", "application/json");

  const response = await apiRaw(path, {
    method: init.method,
    headers,
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    accessToken: init.accessToken,
  });

  const text = await response.text();
  const parsed = text ? safeJsonParse(text) : undefined;

  if (response.ok) return parsed as T;
  throw parseApiError(response.status, parsed);
}

function safeJsonParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}
