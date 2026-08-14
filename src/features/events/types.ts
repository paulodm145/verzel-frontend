import type { CatalogSourceType } from "@/features/catalog/types";

export type EventSourceType = CatalogSourceType;
export type EventStatus = "DRAFT" | "PUBLISHED" | "CANCELED";

export interface Event {
  id: string;
  organizerId: string;
  sourceType: EventSourceType;
  externalId: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  date: string | null;
  venue: string;
  capacity: number;
  price: number;
  status: EventStatus;
  createdAt: string;
}

export type EventSummary = Event;

export interface EventDetail extends Event {
  availableSeatsCount: number;
}

export interface EventListParams {
  search?: string;
  skip?: number;
  take?: number;
}

export type EventsQueryParams = EventListParams;

export interface EventListResponse {
  items: Event[];
  total: number;
  skip: number;
  take: number;
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

export interface CreateEventInput {
  externalId: string;
  sourceType: CatalogSourceType;
  title: string;
  description: string | null;
  imageUrl: string | null;
  date: string;
  venue: string;
  capacity: number;
  price: number;
}

export type UpdateEventInput = Partial<Omit<CreateEventInput, "externalId" | "sourceType">>;
