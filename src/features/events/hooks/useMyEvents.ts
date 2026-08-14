"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { eventsService } from "../services/events-service";
import type { EventListParams } from "../types";

/** Sem `staleTime` próprio de propósito: o padrão global é 0
 * (lib/query-client.ts) — o painel do organizador reflete publish/cancel/edit
 * imediatamente via invalidação, então cachear aqui só arriscaria mostrar
 * status desatualizado depois de uma ação. */
export function useMyEvents(params: EventListParams) {
  return useQuery({
    queryKey: ["events", "mine", params],
    queryFn: () => eventsService.listMine(params),
    placeholderData: keepPreviousData,
  });
}
