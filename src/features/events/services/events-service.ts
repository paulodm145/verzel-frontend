import { httpClient } from "@/lib/http-client";

import type { EventDetail, EventListResponse, EventsQueryParams, SeatMapResponse } from "../types";

/**
 * Chamadas HTTP puras do domínio "eventos". Sem cache, sem estado — isso é
 * responsabilidade dos hooks (useEvents, useEvent, useSeatMap) por cima.
 */
export const eventsService = {
  async getEvents(params: EventsQueryParams, signal?: AbortSignal): Promise<EventListResponse> {
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
};
