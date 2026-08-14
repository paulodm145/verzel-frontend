/**
 * Renovação de sessão em single-flight (spec seção 2.4). Cada `refreshToken`
 * vale uma única vez — reapresentá-lo é tratado como roubo e derruba todas
 * as sessões do usuário (`docs/doc-frontend/02-autenticacao.md`). Sem esta
 * trava, duas chamadas concorrentes ao proxy que caem no fallback reativo de
 * 401 disparariam duas renovações e a segunda deslogaria todo mundo.
 *
 * Limitação documentada: o mapa é por processo. Em deploy distribuído
 * (várias instâncias serverless), duas instâncias podem renovar em paralelo
 * — a solução real seria um lock externo (Redis). Fora do escopo do desafio.
 */
import { apiServer } from "./api-client";

export interface RenewedSession {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

const inFlight = new Map<string, Promise<RenewedSession>>();

export function renewSession(refreshToken: string): Promise<RenewedSession> {
  const existing = inFlight.get(refreshToken);
  if (existing) return existing;

  const promise = apiServer<RenewedSession>("/auth/refresh", {
    method: "POST",
    body: { refreshToken },
  }).finally(() => {
    inFlight.delete(refreshToken);
  });

  inFlight.set(refreshToken, promise);
  return promise;
}
