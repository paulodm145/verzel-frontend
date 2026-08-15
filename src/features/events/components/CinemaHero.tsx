import Link from "next/link";

import { ArrowRight, CalendarDays, MapPin, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";

import { formatEventDate, formatEventPrice } from "../format";
import type { EventSummary } from "../types";
import { EventPoster } from "./EventPoster";

/**
 * Destaque da vitrine. Recebe o evento pronto em vez de consultar por conta
 * própria: hero, fileira e programação vêm do mesmo lote (ver PublicHome), e
 * uma segunda consulta aqui poderia destacar um evento diferente do que a
 * fileira mostra em primeiro lugar.
 */
export function CinemaHero({ event }: { event?: EventSummary }) {
  return (
    <section className="relative isolate overflow-hidden rounded-media bg-cinema text-cinema-foreground">
      {event?.imageUrl && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={event.imageUrl}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 -z-20 h-full w-full scale-105 object-cover"
          />
          {/*
            Scrim direcional, não véu chapado: o véu uniforme escurece a
            imagem inteira por igual e ainda deixa o contraste do texto à mercê
            do pôster sorteado. Com gradiente, a arte respira à direita e o
            lado do texto fica sempre acima do limite de AA.
          */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-r from-cinema via-cinema/92 to-cinema/55"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-linear-to-t from-cinema to-transparent"
          />
        </>
      )}

      <div className="flex flex-col gap-8 px-5 py-10 sm:px-9 sm:py-14 lg:flex-row lg:items-center lg:gap-12 lg:px-14 lg:py-16">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-cinema-muted uppercase">
            <Ticket className="size-4" aria-hidden="true" />
            {event ? "Destaque da programação" : "Sua próxima experiência ao vivo"}
          </p>

          <h1 className="mt-4 text-3xl leading-[1.05] font-bold tracking-[-0.03em] text-balance sm:text-5xl lg:text-6xl">
            {event?.title ?? "Filmes, shows e lugares que valem a saída de casa."}
          </h1>

          {event ? (
            <>
              {event.description && (
                <p className="mt-4 line-clamp-3 max-w-xl text-sm leading-6 text-cinema-muted sm:text-base sm:leading-7">
                  {event.description}
                </p>
              )}
              <dl className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-cinema-muted">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="size-4" aria-hidden="true" />
                  <dt className="sr-only">Data</dt>
                  <dd>{formatEventDate(event.date)}</dd>
                </div>
                <div className="flex min-w-0 items-center gap-1.5">
                  <MapPin className="size-4" aria-hidden="true" />
                  <dt className="sr-only">Local</dt>
                  <dd className="truncate">{event.venue}</dd>
                </div>
                <div className="flex items-center gap-1.5">
                  <dt className="sr-only">Preço por assento</dt>
                  <dd className="font-semibold text-cinema-foreground">
                    {formatEventPrice(event.price)}
                  </dd>
                </div>
              </dl>
            </>
          ) : (
            <p className="mt-4 max-w-xl text-base leading-7 text-cinema-muted">
              Descubra a programação, escolha seu lugar no mapa e leve o ingresso no celular.
            </p>
          )}

          <div className="mt-8 flex flex-wrap gap-3">
            {event && (
              <Button nativeButton={false} size="lg" render={<Link href={`/events/${event.id}`} />}>
                Ver evento
                <ArrowRight className="size-4" />
              </Button>
            )}
            <Button
              nativeButton={false}
              size="lg"
              variant="outline"
              // O `outline` padrão assume fundo de página; sobre --cinema ele
              // precisa da borda e do texto claros para manter contraste.
              className="border-cinema-foreground/30 bg-transparent text-cinema-foreground hover:bg-cinema-foreground/10 hover:text-cinema-foreground dark:border-cinema-foreground/30 dark:bg-transparent"
              render={<Link href="/events" />}
            >
              Ver programação
            </Button>
          </div>
        </div>

        {/* O pôster inteiro fica ao lado a partir de lg; abaixo disso a arte já
            aparece no fundo e repeti-la só empurraria o CTA para fora da tela. */}
        {event?.imageUrl && (
          <div className="hidden w-56 shrink-0 lg:block xl:w-64">
            <EventPoster imageUrl={event.imageUrl} className="shadow-2xl" />
          </div>
        )}
      </div>
    </section>
  );
}
