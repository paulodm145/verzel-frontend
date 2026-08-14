"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { eventsService } from "../services/events-service";
import type { CreateEventInput } from "../types";

export function useCreateEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateEventInput) => eventsService.create(input),
    onSuccess: () => {
      // Prefixo "events" cobre tanto a listagem do organizador ("mine")
      // quanto a pública (epic 03) — invalidateQueries casa por prefixo,
      // então funciona com qualquer chave que comece com "events".
      void queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
