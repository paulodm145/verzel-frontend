/**
 * Adaptador local e temporário para `GET /events/:id/seats`.
 *
 * A feature `events` (epic 03) está sendo construída em paralelo por outro
 * agente e deve nascer com `useSeatMap(eventId)` — quando ela existir, troque
 * este import no checkout e apague este arquivo. Até lá, o checkout desta
 * epic precisa do mapa de assentos para existir, e a instrução do epic 04 é
 * clara: definir um adaptador fino aqui em vez de escrever dentro de
 * `src/features/events/`.
 *
 * `queryKey` usa o mesmo formato provável da feature de eventos
 * (`["events", eventId, "seats"]`) de propósito — se coincidir, a
 * invalidação em `useCreateReservation` já teria efeito imediato depois da
 * troca; se não coincidir, é só uma constante para atualizar num lugar só.
 */
"use client";

import { useQuery, type QueryKey } from "@tanstack/react-query";

import { httpClient } from "@/lib/http-client";
import { STALE_TIME } from "@/lib/query-client";

export interface Seat {
  id: string;
  label: string;
  available: boolean;
}

export interface SeatMapResponse {
  items: Seat[];
  total: number;
  availableCount: number;
}

export function seatMapQueryKey(eventId: string): QueryKey {
  return ["events", eventId, "seats"];
}

export function useSeatMapAdapter(eventId: string | undefined) {
  return useQuery({
    queryKey: seatMapQueryKey(eventId ?? ""),
    queryFn: async () => {
      const { data } = await httpClient.get<SeatMapResponse>(`/events/${eventId}/seats`);
      return data;
    },
    enabled: Boolean(eventId),
    // Zero de propósito (07-performance.md item 8): outra pessoa pode
    // reservar entre o carregamento e o clique.
    staleTime: STALE_TIME.seats,
  });
}
