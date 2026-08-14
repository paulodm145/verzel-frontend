/**
 * Adaptador local e temporário para `GET /events/:id` — só os campos que o
 * cabeçalho do checkout precisa mostrar (título, local, data, preço). Mesma
 * justificativa do `seat-map-adapter.ts`: a feature `events` ainda não
 * existe nesta branch. Trocar por `useEvent(eventId)` quando ela chegar.
 */
"use client";

import { useQuery } from "@tanstack/react-query";

import { httpClient } from "@/lib/http-client";
import { STALE_TIME } from "@/lib/query-client";

export interface EventSummary {
  id: string;
  title: string;
  venue: string;
  date: string;
  price: number;
  status: "DRAFT" | "PUBLISHED" | "CANCELED";
}

export function useEventSummaryAdapter(eventId: string | undefined) {
  return useQuery({
    queryKey: ["events", eventId ?? "", "summary"],
    queryFn: async () => {
      const { data } = await httpClient.get<EventSummary>(`/events/${eventId}`);
      return data;
    },
    enabled: Boolean(eventId),
    staleTime: STALE_TIME.eventDetail,
  });
}
