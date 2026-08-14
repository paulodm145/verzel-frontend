"use client";

import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/query-client";

import { ticketsService } from "../services/tickets-service";

/**
 * `GET /tickets/:code`, pública — usada pela página de compartilhamento.
 * `data === null` (sem erro) é o resultado de um código inexistente ou já
 * digitado errado: a tela decide o que mostrar, não é uma exceção.
 */
export function useTicketByCode(code: string) {
  return useQuery({
    queryKey: ["tickets", "byCode", code],
    queryFn: () => ticketsService.getByCode(code),
    enabled: code.length > 0,
    staleTime: STALE_TIME.tickets,
    retry: false,
  });
}
