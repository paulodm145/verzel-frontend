"use client";

import { useMemo } from "react";

import { Armchair, ScanQrCode, TicketCheck } from "lucide-react";

import { CarouselTrack } from "@/components/media/CarouselTrack";
import { Skeleton } from "@/components/ui/skeleton";

import { useEvents } from "../hooks/useEvents";
import type { EventSummary } from "../types";
import { CinemaHero } from "./CinemaHero";
import { EventCard } from "./EventCard";
import { EventsExplorer } from "./EventsExplorer";

/**
 * Precisa bater com o `pageSize` do EventsExplorer abaixo: com os mesmos
 * parâmetros, a chave de Query é a mesma e o hero, a fileira e a primeira
 * página da programação saem de uma única requisição.
 */
const HOME_TAKE = 10;

export function PublicHome() {
  const { data, isLoading } = useEvents({ skip: 0, take: HOME_TAKE });

  // Ordena por data crescente para a fileira "estreia em breve". Eventos sem
  // data (o provedor externo nem sempre informa) vão para o fim em vez de
  // sumirem — some seria perder um evento comprável.
  const upcoming = useMemo(() => sortByDate(data?.items ?? []), [data?.items]);

  return (
    <div className="flex flex-col gap-12 sm:gap-16">
      {isLoading ? (
        <Skeleton className="h-[26rem] w-full rounded-media sm:h-[30rem]" />
      ) : (
        <CinemaHero event={upcoming[0]} />
      )}

      {(isLoading || upcoming.length > 0) && (
        <section aria-labelledby="estreias">
          <SectionHeading
            id="estreias"
            eyebrow="Estreia em breve"
            title="O que vem primeiro"
            hint="Arraste para ver mais"
          />
          {isLoading ? <CarouselSkeleton /> : <UpcomingRow events={upcoming} />}
        </section>
      )}

      <section aria-label="Como funciona" className="grid gap-6 sm:grid-cols-3">
        {HOW_IT_WORKS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="flex gap-3.5">
            <Icon className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold">{title}</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </div>
        ))}
      </section>

      <section aria-labelledby="programacao">
        <SectionHeading
          id="programacao"
          eyebrow="Agora em cartaz"
          title="Toda a programação"
          hint="Filmes e shows selecionados"
        />
        <EventsExplorer pageSize={HOME_TAKE} />
      </section>
    </div>
  );
}

/**
 * A fileira do carrossel. Uma só, por decisão registrada: `GET /events` tem
 * apenas busca e paginação, então "Populares" ou "Recomendados" seriam rótulos
 * sobre dados que a API não expressa.
 */
function UpcomingRow({ events }: { events: EventSummary[] }) {
  return (
    <CarouselTrack label="Estreia em breve">
      {events.map((event) => (
        <div
          key={event.id}
          className="w-[9.5rem] shrink-0 snap-start sm:w-44 lg:w-48"
          data-testid="carousel-item"
        >
          <EventCard event={event} />
        </div>
      ))}
    </CarouselTrack>
  );
}

function CarouselSkeleton() {
  return (
    // Mesma silhueta e mesmas larguras da fileira real: o conteúdo entra sem
    // empurrar o que está abaixo.
    <div className="flex gap-3 overflow-hidden px-1 py-2 sm:gap-4" aria-hidden="true">
      {Array.from({ length: 6 }, (_, index) => (
        <div key={index} className="w-[9.5rem] shrink-0 sm:w-44 lg:w-48">
          <Skeleton className="aspect-2/3 w-full rounded-media" />
          <Skeleton className="mt-3 h-4 w-4/5" />
          <Skeleton className="mt-2 h-3 w-2/5" />
        </div>
      ))}
    </div>
  );
}

function SectionHeading({
  id,
  eyebrow,
  title,
  hint,
}: {
  id: string;
  eyebrow: string;
  title: string;
  hint: string;
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">{eyebrow}</p>
        <h2 id={id} className="mt-1 text-2xl font-bold tracking-[-0.025em] sm:text-3xl">
          {title}
        </h2>
      </div>
      <p className="hidden text-sm text-muted-foreground sm:block">{hint}</p>
    </div>
  );
}

function sortByDate(events: EventSummary[]): EventSummary[] {
  return [...events].sort((a, b) => {
    if (!a.date) return 1;
    if (!b.date) return -1;
    return a.date.localeCompare(b.date);
  });
}

const HOW_IT_WORKS = [
  {
    icon: Armchair,
    title: "Seu lugar",
    description: "Veja a disponibilidade e escolha o assento no mapa.",
  },
  {
    icon: TicketCheck,
    title: "Compra direta",
    description: "Reserve e simule o pagamento em poucos passos.",
  },
  {
    icon: ScanQrCode,
    title: "Entrada no celular",
    description: "O QR Code fica pronto assim que o pagamento aprova.",
  },
] as const;
