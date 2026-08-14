"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { eventsService } from "../services/events-service";
import type { Event } from "../types";

/** Publicar e cancelar têm a mesma forma (id -> Event) e a mesma
 * invalidação: os dois mudam o que `GET /events` (pública) deve mostrar. */
function useEventTransition(mutationFn: (id: string) => Promise<Event>) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function usePublishEvent() {
  return useEventTransition((id) => eventsService.publish(id));
}

export function useCancelEvent() {
  return useEventTransition((id) => eventsService.cancel(id));
}
