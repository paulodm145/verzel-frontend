"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { seatMapQueryKey } from "../lib/seat-map-adapter";
import { reservationsService } from "../services/reservations-service";
import { useReservationIntentStore } from "../store";
import { RESERVATIONS_QUERY_KEY } from "./useMyReservations";

/**
 * `DELETE /reservations/:id` — cancela a própria reserva pendente e libera o
 * assento na hora. Invalida a lista de reservas e o mapa de assentos do
 * evento (a `Reservation` devolvida já traz `eventId`, sem precisar de outra
 * chamada para saber qual mapa invalidar).
 */
export function useCancelReservation() {
  const queryClient = useQueryClient();
  const clearIntent = useReservationIntentStore((state) => state.clear);

  return useMutation({
    mutationFn: (id: string) => reservationsService.cancel(id),
    onSuccess: (reservation) => {
      clearIntent();
      void queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: seatMapQueryKey(reservation.eventId) });
    },
  });
}
