"use client";

import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/query-client";

import { ticketsService } from "../services/tickets-service";
import type { MyTicketsParams } from "../types";

export const MY_TICKETS_QUERY_KEY = ["tickets", "mine"] as const;

/**
 * `GET /tickets/mine`. O `event` já vem embutido no item — nunca chamar
 * `/events/:id` por ingresso (07-performance.md, item 4). Uma renderização
 * da lista é uma requisição, ponto.
 */
export function useMyTickets(params: MyTicketsParams = {}) {
  return useQuery({
    queryKey: [...MY_TICKETS_QUERY_KEY, params.skip ?? 0, params.take ?? 20],
    queryFn: () => ticketsService.getMine(params),
    staleTime: STALE_TIME.tickets,
  });
}
