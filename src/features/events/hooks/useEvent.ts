import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/query-client";

import { eventsService } from "../services/events-service";
import type { EventDetail } from "../types";

export function eventQueryOptions(eventId: string): UseQueryOptions<EventDetail> {
  return {
    queryKey: ["events", eventId] as const,
    queryFn: ({ signal }) => eventsService.getEvent(eventId, signal),
    staleTime: STALE_TIME.eventDetail,
    enabled: eventId.length > 0,
  };
}

export function useEvent(eventId: string) {
  return useQuery(eventQueryOptions(eventId));
}
