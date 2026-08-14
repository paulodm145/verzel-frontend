import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/query-client";

import { eventsService } from "../services/events-service";
import type { EventListResponse, EventsQueryParams } from "../types";

/**
 * Opções de query exportadas à parte (e não só dentro do hook) para dar a
 * `useEvents` uma forma testável sem precisar montar componente nenhum.
 */
export function eventsQueryOptions(params: EventsQueryParams): UseQueryOptions<EventListResponse> {
  return {
    queryKey: ["events", params] as const,
    // O `signal` vem do próprio TanStack Query: quando os parâmetros mudam
    // (nova busca, nova página) antes da resposta anterior chegar, ele
    // cancela a requisição obsoleta — o AbortController pedido no backlog.
    queryFn: ({ signal }) => eventsService.getEvents(params, signal),
    staleTime: STALE_TIME.events,
  };
}

/** GET /events (pública) — listagem paginada por skip/take, com busca opcional. */
export function useEvents(params: EventsQueryParams) {
  return useQuery(eventsQueryOptions(params));
}
