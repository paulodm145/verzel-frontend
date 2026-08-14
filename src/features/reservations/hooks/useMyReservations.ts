"use client";

import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/query-client";

import { reservationsService } from "../services/reservations-service";

export const RESERVATIONS_QUERY_KEY = ["reservations", "mine"] as const;

interface UseMyReservationsParams {
  skip?: number;
  take?: number;
}

/**
 * `GET /reservations/mine` já traz `seatLabel` — nunca chame o mapa de
 * assentos para descobrir o rótulo de uma reserva (07-performance.md item 4).
 */
export function useMyReservations(params: UseMyReservationsParams = {}) {
  return useQuery({
    queryKey: [...RESERVATIONS_QUERY_KEY, params],
    queryFn: () => reservationsService.listMine(params),
    staleTime: STALE_TIME.reservations,
  });
}
