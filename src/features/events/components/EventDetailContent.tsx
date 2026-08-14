"use client";

import Link from "next/link";

import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";

import { isApiError } from "@/lib/api-errors";
import { messages } from "@/lib/messages";

import { Skeleton } from "@/components/ui/skeleton";

import { formatEventDate, formatEventPrice } from "../format";
import { useEvent } from "../hooks/useEvent";
import { EventsErrorState } from "./EventsErrorState";
import { SeatMapSection } from "./SeatMapSection";

interface EventDetailContentProps {
  eventId: string;
}

export function EventDetailContent({ eventId }: EventDetailContentProps) {
  // useEvent aqui e useSeatMap dentro de <SeatMapSection> disparam ao montar
  // juntos, sem um depender do outro — o TanStack Query já busca os dois em
  // paralelo (07-performance.md item 6), sem precisar de Promise.all manual.
  const { data: event, isLoading, isError, error } = useEvent(eventId);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="aspect-21/9 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (isError) {
    const notFound = isApiError(error) && error.status === 404;
    return (
      <EventsErrorState
        message={
          notFound
            ? "Evento não encontrado — pode ter sido removido ou ainda não foi publicado."
            : isApiError(error)
              ? error.message
              : messages.network.unexpected
        }
        requestId={isApiError(error) ? error.requestId : undefined}
      />
    );
  }

  if (!event) return null;

  return (
    <div className="flex flex-col gap-4">
      <Link
        href="/events"
        className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Voltar para eventos
      </Link>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-lg border border-border bg-muted">
            {event.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- domínio externo, ver EventCard
              <img src={event.imageUrl} alt="" className="aspect-21/9 w-full object-cover" />
            ) : (
              <div className="flex aspect-21/9 w-full items-center justify-center">
                <CalendarDays className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              </div>
            )}
          </div>

          <div>
            <h1 className="text-xl font-semibold text-foreground">{event.title}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" aria-hidden="true" />
                {formatEventDate(event.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" aria-hidden="true" />
                {event.venue}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" aria-hidden="true" />
                {event.availableSeatsCount} de {event.capacity} lugares livres
              </span>
            </div>
          </div>

          {event.description && (
            <p className="text-sm text-foreground/90 whitespace-pre-line">{event.description}</p>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border p-3">
            <p className="text-xs text-muted-foreground">Valor do ingresso</p>
            <p className="text-2xl font-semibold text-foreground">
              {formatEventPrice(event.price)}
            </p>
          </div>

          <SeatMapSection eventId={event.id} />
        </div>
      </div>
    </div>
  );
}
