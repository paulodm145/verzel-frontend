import Link from "next/link";

import { CalendarDays, ImageOff, MapPin } from "lucide-react";

import { formatEventDate, formatEventPrice } from "../format";
import type { EventSummary } from "../types";

interface EventCardProps {
  event: EventSummary;
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors hover:border-primary/50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      <div className="relative aspect-16/9 w-full shrink-0 overflow-hidden bg-muted">
        {event.imageUrl ? (
          // Imagem vem de provedor externo (TMDb/Ticketmaster), domínio
          // imprevisível — usar <img> em vez de next/image evita manter uma
          // allowlist de hosts que o organizador não controla.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={event.imageUrl}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-150 group-hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <ImageOff className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="line-clamp-2 text-sm font-semibold text-card-foreground">{event.title}</h3>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{formatEventDate(event.date)}</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="truncate">{event.venue}</span>
        </div>

        <div className="mt-auto pt-1.5 text-sm font-semibold text-foreground">
          {formatEventPrice(event.price)}
        </div>
      </div>
    </Link>
  );
}
