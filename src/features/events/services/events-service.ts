import { httpClient } from "@/lib/http-client";

import type {
  CreateEventInput,
  Event,
  EventDetail,
  EventListParams,
  EventListResponse,
  SeatMapResponse,
  UpdateEventInput,
} from "../types";

export const eventsService = {
  async getEvents(params: EventListParams, signal?: AbortSignal): Promise<EventListResponse> {
    const { data } = await httpClient.get<EventListResponse>("/events", { params, signal });
    return data;
  },

  async getEvent(id: string, signal?: AbortSignal): Promise<EventDetail> {
    const { data } = await httpClient.get<EventDetail>(`/events/${id}`, { signal });
    return data;
  },

  async getEventSeats(id: string, signal?: AbortSignal): Promise<SeatMapResponse> {
    const { data } = await httpClient.get<SeatMapResponse>(`/events/${id}/seats`, { signal });
    return data;
  },

  async listMine(params: EventListParams): Promise<EventListResponse> {
    const { data } = await httpClient.get<EventListResponse>("/events/mine", { params });
    return data;
  },

  async create(input: CreateEventInput): Promise<Event> {
    const { data } = await httpClient.post<Event>("/events", input);
    return data;
  },

  async update(id: string, input: UpdateEventInput): Promise<Event> {
    const { data } = await httpClient.patch<Event>(`/events/${id}`, input);
    return data;
  },

  async publish(id: string): Promise<Event> {
    const { data } = await httpClient.post<Event>(`/events/${id}/publish`);
    return data;
  },

  async cancel(id: string): Promise<Event> {
    const { data } = await httpClient.post<Event>(`/events/${id}/cancel`);
    return data;
  },
};
