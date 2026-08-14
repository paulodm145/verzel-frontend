"use client";

import { TicketX } from "lucide-react";

import { isApiError } from "@/lib/api-errors";

import { Skeleton } from "@/components/ui/skeleton";

import { useMyTickets } from "../hooks/useMyTickets";
import { TicketCard } from "./TicketCard";

/**
 * Tela `/my-tickets`. Sem `AsyncBoundary` de propósito — aquele componente é
 * do epic 02 (UI kit), em desenvolvimento em paralelo neste desafio; os
 * estados aqui são locais e simples o bastante para não valer a pena
 * duplicar a API dele.
 */
export function MyTicketsScreen() {
  const { data, isPending, isError, error } = useMyTickets();

  if (isPending) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true" aria-label="Carregando ingressos">
        {[0, 1, 2].map((key) => (
          <Skeleton key={key} className="h-40 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm">
        <p className="font-medium text-destructive">
          {isApiError(error) ? error.message : "Não foi possível carregar seus ingressos."}
        </p>
        {isApiError(error) && error.requestId && (
          <p className="mt-1 text-xs text-muted-foreground">Código: {error.requestId}</p>
        )}
      </div>
    );
  }

  if (data.items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border p-10 text-center text-muted-foreground">
        <TicketX className="h-8 w-8" aria-hidden="true" />
        <p className="text-sm">Você ainda não tem ingressos.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {data.items.map((ticket) => (
        <TicketCard key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
}
