"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { isApiError } from "@/lib/api-errors";

import { seatMapQueryKey } from "../lib/seat-map-adapter";
import { reservationsService } from "../services/reservations-service";
import { useReservationIntentStore } from "../store";
import type { CreateReservationResult } from "../types";
import { RESERVATIONS_QUERY_KEY } from "./useMyReservations";

interface CreateReservationArgs {
  eventId: string;
  seatId: string;
}

/**
 * `POST /events/:id/reservations`. A chave de idempotência nasce aqui, na
 * hora do clique — não antes (não é gerada ao só selecionar o assento no
 * mapa) — via `getOrCreateKey`, que devolve a mesma chave se for a mesma
 * tentativa (mesmo `seatId`) e uma nova se o usuário trocou de assento.
 *
 * `409`/`404` **sempre** disparam o refetch do mapa de assentos
 * (07-performance.md item 7): o usuário precisa ver o assento ficar
 * vermelho, e um `seatId` de 404 pode ter saído de um mapa desatualizado.
 * Travar o botão durante a chamada é responsabilidade de quem consome este
 * hook (`mutation.isPending`), não deste hook.
 */
export function useCreateReservation() {
  const queryClient = useQueryClient();
  const getOrCreateKey = useReservationIntentStore((state) => state.getOrCreateKey);
  const clearIntent = useReservationIntentStore((state) => state.clear);

  return useMutation<CreateReservationResult, unknown, CreateReservationArgs>({
    mutationFn: ({ eventId, seatId }) => {
      const idempotencyKey = getOrCreateKey(seatId);
      return reservationsService.create({ eventId, seatId, idempotencyKey });
    },
    onSuccess: () => {
      clearIntent();
      void queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
    },
    onError: (error, variables) => {
      if (isApiError(error) && (error.status === 409 || error.status === 404)) {
        void queryClient.invalidateQueries({ queryKey: seatMapQueryKey(variables.eventId) });
      }
    },
  });
}
