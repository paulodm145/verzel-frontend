"use client";

import { useQuery } from "@tanstack/react-query";

import { isApiError } from "@/lib/api-errors";
import { STALE_TIME } from "@/lib/query-client";

import { eventsService } from "../services/events-service";

export function useOrganizerEvent(id: string) {
  return useQuery({
    queryKey: ["events", "organizer-detail", id],
    queryFn: async () => {
      try {
        return await eventsService.getEvent(id);
      } catch (error) {
        if (isApiError(error) && error.status === 404) {
          const mine = await eventsService.listMine({ take: 50 });
          const found = mine.items.find((event) => event.id === id);
          if (found) return found;
        }
        throw error;
      }
    },
    staleTime: STALE_TIME.eventDetail,
    enabled: id.length > 0,
  });
}
