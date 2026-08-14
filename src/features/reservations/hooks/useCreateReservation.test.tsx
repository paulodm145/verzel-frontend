import type { ReactNode } from "react";

import { server } from "@/test/msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { beforeEach, describe, expect, it } from "vitest";

import { seatMapQueryKey } from "../lib/seat-map-adapter";
import { useReservationIntentStore } from "../store";
import { useCreateReservation } from "./useCreateReservation";

const EVENT_ID = "evento-1";
const SEAT_ID = "assento-a1";

function wrapper(client: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useCreateReservation", () => {
  beforeEach(() => {
    useReservationIntentStore.getState().clear();
  });

  it("um 409 (assento ocupado) invalida o mapa de assentos do evento", async () => {
    server.use(
      http.post(`http://localhost:3000/api/v/events/${EVENT_ID}/reservations`, () =>
        HttpResponse.json(
          { error: { code: "CONFLICT", message: "Assento já reservado", requestId: "req-1" } },
          { status: 409 },
        ),
      ),
    );

    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    // Simula o mapa já carregado (staleTime 0) antes da tentativa de reserva.
    client.setQueryData(seatMapQueryKey(EVENT_ID), { items: [], total: 0, availableCount: 0 });

    const { result } = renderHook(() => useCreateReservation(), { wrapper: wrapper(client) });

    await expect(
      result.current.mutateAsync({ eventId: EVENT_ID, seatId: SEAT_ID }),
    ).rejects.toMatchObject({ status: 409 });

    await waitFor(() => {
      expect(client.getQueryState(seatMapQueryKey(EVENT_ID))?.isInvalidated).toBe(true);
    });
  });

  it("um 404 (assento fora do evento) também invalida o mapa", async () => {
    server.use(
      http.post(`http://localhost:3000/api/v/events/${EVENT_ID}/reservations`, () =>
        HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "Assento não encontrado", requestId: "req-2" } },
          { status: 404 },
        ),
      ),
    );

    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    client.setQueryData(seatMapQueryKey(EVENT_ID), { items: [], total: 0, availableCount: 0 });

    const { result } = renderHook(() => useCreateReservation(), { wrapper: wrapper(client) });

    await expect(
      result.current.mutateAsync({ eventId: EVENT_ID, seatId: SEAT_ID }),
    ).rejects.toMatchObject({ status: 404 });

    await waitFor(() => {
      expect(client.getQueryState(seatMapQueryKey(EVENT_ID))?.isInvalidated).toBe(true);
    });
  });

  it("sucesso não invalida o mapa (nenhum 409 aconteceu)", async () => {
    server.use(
      http.post(`http://localhost:3000/api/v/events/${EVENT_ID}/reservations`, () =>
        HttpResponse.json({
          id: "reserva-1",
          eventId: EVENT_ID,
          customerId: "cliente-1",
          seatId: SEAT_ID,
          seatLabel: "A1",
          status: "PENDING",
          expiresAt: new Date(Date.now() + 600_000).toISOString(),
          createdAt: new Date().toISOString(),
        }),
      ),
    );

    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    client.setQueryData(seatMapQueryKey(EVENT_ID), { items: [], total: 0, availableCount: 0 });

    const { result } = renderHook(() => useCreateReservation(), { wrapper: wrapper(client) });

    await result.current.mutateAsync({ eventId: EVENT_ID, seatId: SEAT_ID });

    expect(client.getQueryState(seatMapQueryKey(EVENT_ID))?.isInvalidated).toBe(false);
  });
});
