/** Tipos do domínio "eventos" — espelham o contrato de docs/doc-frontend/03-eventos-e-catalogo.md. */

export type EventSourceType = "SHOW" | "MOVIE";
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELED";

export interface EventSummary {
  id: string;
  organizerId: string;
  sourceType: EventSourceType;
  externalId: string;
  title: string;
  /** Pode vir null — nem todo item de catálogo tem sinopse. */
  description: string | null;
  /** Pode vir null — nem todo item de catálogo tem imagem. */
  imageUrl: string | null;
  /** Pode vir null quando o provedor externo não informa data. */
  date: string | null;
  venue: string;
  capacity: number;
  /** Número, não string — nunca formatar sem passar por Intl.NumberFormat. */
  price: number;
  status: EventStatus;
  createdAt: string;
}

/** GET /events/:id devolve o evento mais a contagem de assentos livres. */
export interface EventDetail extends EventSummary {
  availableSeatsCount: number;
}

export interface EventListResponse {
  items: EventSummary[];
  total: number;
  skip: number;
  take: number;
}

export interface EventsQueryParams {
  search?: string;
  skip?: number;
  take?: number;
}

export interface Seat {
  id: string;
  label: string;
  available: boolean;
}

export interface SeatMapResponse {
  items: Seat[];
  total: number;
  availableCount: number;
}
