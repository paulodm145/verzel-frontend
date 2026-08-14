import { QueryClient } from "@tanstack/react-query";

import { isApiError } from "./api-errors";

/** staleTime por rota, conforme a tabela do docs/doc-frontend/07-performance.md. */
export const STALE_TIME = {
  events: 60_000,
  eventDetail: 60_000,
  /** Zero de propósito: outra pessoa pode reservar entre o carregamento e o clique. */
  seats: 0,
  reservations: 0,
  tickets: 30_000,
  catalog: 300_000,
} as const;

const MAX_RETRIES = 2;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Padrão global é 0, não STALE_TIME.events: um hook que esquece de
        // declarar seu próprio staleTime deve custar uma requisição extra,
        // nunca servir um mapa de assentos vendido a partir de cache.
        staleTime: 0,
        refetchOnWindowFocus: true,
        retry: (failureCount: number, error: Error) => {
          // 4xx não melhora repetindo: entrada inválida, sem permissão ou inexistente.
          if (isApiError(error) && error.status < 500) return false;
          return failureCount < MAX_RETRIES;
        },
      },
      mutations: { retry: false },
    },
  });
}
