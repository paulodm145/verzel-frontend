"use client";

import { useState } from "react";

import { useQueryClient } from "@tanstack/react-query";

import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import type { PaymentResult } from "@/features/payment/types";

import { useCreateReservation } from "../hooks/useCreateReservation";
import { useEventSummaryAdapter } from "../lib/event-summary-adapter";
import { formatMoney } from "../lib/format-money";
import { seatMapQueryKey, useSeatMapAdapter, type Seat } from "../lib/seat-map-adapter";
import type { Reservation } from "../types";
import { ActiveReservationPanel } from "./ActiveReservationPanel";
import { CheckoutSteps } from "./CheckoutSteps";
import { SeatSelectionPanel } from "./SeatSelectionPanel";
import { TicketIssuedPanel } from "./TicketIssuedPanel";

interface CheckoutFlowProps {
  eventId: string;
}

/**
 * Orquestra as três fases do checkout: escolher assento → reserva ativa
 * (com contador e pagamento) → ingresso emitido. Detalhe do evento e mapa de
 * assentos são dois `useQuery` independentes — cada um dispara sua própria
 * requisição no mount, o que já os deixa em paralelo sem precisar de
 * `Promise.all` explícito (07-performance.md item 6).
 */
export function CheckoutFlow({ eventId }: CheckoutFlowProps) {
  const queryClient = useQueryClient();
  const eventQuery = useEventSummaryAdapter(eventId);
  const seatsQuery = useSeatMapAdapter(eventId);
  const createReservation = useCreateReservation();

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [issuedSeatLabel, setIssuedSeatLabel] = useState<string | null>(null);
  const currentStep = issuedSeatLabel ? 3 : reservation ? 2 : selectedSeat ? 1 : 0;

  function handleReserve() {
    if (!selectedSeat) return;
    createReservation.mutate(
      { eventId, seatId: selectedSeat.id },
      {
        onSuccess: ({ reservation: created }) => {
          setReservation(created);
          setSelectedSeat(null);
        },
        onError: () => setSelectedSeat(null),
      },
    );
  }

  function handleExpire() {
    setReservation(null);
    void queryClient.invalidateQueries({ queryKey: seatMapQueryKey(eventId) });
  }

  function handleCanceled() {
    setReservation(null);
  }

  function handleApproved(payment: PaymentResult) {
    if (reservation && payment.status === "APPROVED") setIssuedSeatLabel(reservation.seatLabel);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div className="rounded-xl border border-border/70 bg-card p-4">
        <CheckoutSteps current={currentStep} />
      </div>
      <AsyncBoundary
        isLoading={eventQuery.isLoading || seatsQuery.isLoading}
        error={eventQuery.error ?? seatsQuery.error}
        onRetry={() => {
          void eventQuery.refetch();
          void seatsQuery.refetch();
        }}
      >
        {eventQuery.data && (
          <div>
            <h1 className="font-heading text-lg font-medium text-foreground">
              {eventQuery.data.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              {eventQuery.data.venue} · {formatMoney(eventQuery.data.price)} por assento
            </p>
          </div>
        )}

        {issuedSeatLabel ? (
          <TicketIssuedPanel seatLabel={issuedSeatLabel} />
        ) : reservation ? (
          <ActiveReservationPanel
            reservation={reservation}
            onExpire={handleExpire}
            onCanceled={handleCanceled}
            onApproved={handleApproved}
          />
        ) : (
          <SeatSelectionPanel
            seats={seatsQuery.data?.items ?? []}
            selectedSeat={selectedSeat}
            onSelectSeat={setSelectedSeat}
            onReserve={handleReserve}
            isReserving={createReservation.isPending}
            reserveError={createReservation.error}
          />
        )}
      </AsyncBoundary>
    </div>
  );
}
