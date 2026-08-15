"use client";

import { isApiError } from "@/lib/api-errors";
import { messages } from "@/lib/messages";

import { Skeleton } from "@/components/ui/skeleton";

import { useSeatMap } from "../hooks/useSeatMap";
import { EventsErrorState } from "./EventsErrorState";
import { SeatMap } from "./SeatMap";

interface SeatMapSectionProps {
  eventId: string;
}

/**
 * Busca o mapa (staleTime 0) e decide o estado visual. O refetch ao voltar
 * o foco para a aba já é coberto pelo padrão global de
 * `refetchOnWindowFocus: true` em `lib/query-client.ts` — combinado com
 * staleTime 0, qualquer foco recarrega o mapa sem precisar de listener
 * manual de `visibilitychange` aqui.
 */
export function SeatMapSection({ eventId }: SeatMapSectionProps) {
  const { data, isLoading, isError, error } = useSeatMap(eventId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-muted/60 p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <EventsErrorState
        message={isApiError(error) ? error.message : messages.network.unexpected}
        requestId={isApiError(error) ? error.requestId : undefined}
      />
    );
  }

  if (!data) return null;

  return <SeatMap seats={data.items} availableCount={data.availableCount} />;
}
