"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { eventsService } from "../services/events-service";
import type { UpdateEventInput } from "../types";

export function useUpdateEvent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateEventInput) => eventsService.update(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
