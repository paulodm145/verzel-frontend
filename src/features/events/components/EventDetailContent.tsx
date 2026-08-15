"use client";

import Link from "next/link";

import { ArrowLeft, CalendarDays, MapPin, Users } from "lucide-react";

import { isApiError } from "@/lib/api-errors";
import { messages } from "@/lib/messages";

import { Skeleton } from "@/components/ui/skeleton";

import { formatEventDate } from "../format";
import { useEvent } from "../hooks/useEvent";
import { EventsErrorState } from "./EventsErrorState";
import { PurchaseCallout } from "./PurchaseCallout";
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
    <div className="flex flex-col gap-6">
      <Link
        href="/events"
        className="flex w-fit items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
        Voltar para eventos
      </Link>

      <section className="relative isolate overflow-hidden rounded-3xl bg-foreground p-5 text-background sm:p-8 lg:p-10">
        {event.imageUrl && (
          // Imagem ampliada é apenas atmosfera; o pôster abaixo permanece integral.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt=""
            className="absolute inset-0 -z-20 h-full w-full scale-110 object-cover opacity-20 blur-xl"
          />
        )}
        <div className="absolute inset-0 -z-10 bg-foreground/80" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-end">
          <div className="grid gap-7 md:grid-cols-[220px_minmax(0,1fr)] md:items-end">
            <div className="aspect-2/3 overflow-hidden rounded-2xl bg-background/10 shadow-2xl">
              {event.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- domínio externo, ver EventCard
                <img src={event.imageUrl} alt="" className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                </div>
              )}
            </div>

            <div className="pb-1">
              <p className="mb-3 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
                Em cartaz
              </p>
              <h1 className="text-3xl leading-tight font-bold tracking-[-0.035em] text-background sm:text-5xl">
                {event.title}
              </h1>
              <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-background/70">
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
              {event.description && (
                <p className="mt-6 max-w-2xl text-sm leading-6 text-background/80 whitespace-pre-line">
                  {event.description}
                </p>
              )}
            </div>
          </div>
          <PurchaseCallout
            eventId={event.id}
            price={event.price}
            availableSeats={event.availableSeatsCount}
          />
        </div>
      </section>

      <SeatMapSection eventId={event.id} />
    </div>
  );
}
