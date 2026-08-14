import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/query-client";

import { eventsService } from "../services/events-service";
import type { SeatMapResponse } from "../types";

export function seatMapQueryOptions(eventId: string): UseQueryOptions<SeatMapResponse> {
  return {
    queryKey: ["events", eventId, "seats"] as const,
    queryFn: ({ signal }) => eventsService.getEventSeats(eventId, signal),
    // staleTime 0 de propósito (07-performance.md item 8): entre o
    // carregamento da tela e o clique do usuário, outra pessoa pode
    // reservar o mesmo assento. Servir do cache é a receita para vender o
    // mesmo lugar duas vezes. O refetch ao focar a janela já vem do padrão
    // global (refetchOnWindowFocus: true em lib/query-client.ts) — não
    // precisa ser repetido aqui.
    staleTime: STALE_TIME.seats,
    enabled: eventId.length > 0,
  };
}

/** GET /events/:id/seats (pública) — de onde sai o seatId exigido pela reserva. */
export function useSeatMap(eventId: string) {
  return useQuery(seatMapQueryOptions(eventId));
}
