"use client";

import { useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/query-client";

import { checkInService } from "../services/check-in-service";

export function useGateEvents() {
  return useQuery({
    queryKey: ["check-in", "events"],
    queryFn: () => checkInService.listPublishedEvents(),
    staleTime: STALE_TIME.events,
  });
}
