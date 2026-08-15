import Link from "next/link";

import { CalendarDays, MapPin } from "lucide-react";

import { formatEventDate, formatEventPrice } from "../format";
import type { EventSummary } from "../types";
import { EventPoster } from "./EventPoster";

interface EventCardProps {
  event: EventSummary;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group/card flex min-w-0 flex-col rounded-media focus-visible:ring-3 focus-visible:ring-ring/60 focus-visible:outline-none"
    >
      <div className="relative transition-transform duration-300 group-hover/card:-translate-y-1">
        <EventPoster
          imageUrl={event.imageUrl}
          className="shadow-sm transition-shadow duration-300 group-hover/card:shadow-xl"
        />

        {/*
          Sobreposição de hover: reforça o preço e nomeia a ação. É enfeite
          progressivo — o preço também vive abaixo do pôster, então quem chega
          por teclado ou toque nunca depende dela para ler a informação.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 hidden rounded-b-media bg-linear-to-t from-cinema via-cinema/85 to-transparent px-3 pt-10 pb-3 opacity-0 transition-opacity duration-200 group-hover/card:opacity-100 pointer-fine:block"
        >
          <span className="text-sm font-bold text-cinema-foreground">
            {formatEventPrice(event.price)}
          </span>
          <span className="mt-0.5 block text-xs font-medium text-cinema-muted">Ver detalhes</span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-0.5 pt-3">
        <h3 className="line-clamp-2 text-sm leading-snug font-semibold tracking-[-0.01em] text-foreground">
          {event.title}
        </h3>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{formatEventDate(event.date)}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="size-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{event.venue}</span>
        </div>

        <div className="mt-auto pt-1.5">
          <span className="text-sm font-bold text-primary">{formatEventPrice(event.price)}</span>
          <span className="ml-1.5 text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            por assento
          </span>
        </div>
      </div>
    </Link>
  );
}
