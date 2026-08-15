"use client";

import { useCallback, useRef } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { RESERVATIONS_QUERY_KEY } from "@/features/reservations/hooks/useMyReservations";
import { MY_TICKETS_QUERY_KEY } from "@/features/tickets/hooks/useMyTickets";

import { paymentService } from "../services/payment-service";
import type { SimulatePaymentInput } from "../types";

/** Identifica a tentativa: mesma reserva + mesmo método + mesmo resultado
 * simulado. Mudar qualquer um desses é uma decisão nova do usuário. */
function attemptSignature(input: SimulatePaymentInput): string {
  return `${input.reservationId}:${input.paymentMethod ?? "CREDIT_CARD"}:${input.simulate ?? "APPROVED"}`;
}

/**
 * `POST /reservations/:id/payment` — nova `Idempotency-Key` em relação à da
 * reserva (chaves não se misturam entre endpoints), mas com a mesma regra de
 * "uma por intenção": clicar duas vezes em "Aprovar" reaproveita a chave;
 * trocar para "Recusar" (ou de método) é uma tentativa nova.
 */
export function useSimulatePayment() {
  const queryClient = useQueryClient();
  const attemptRef = useRef<{ signature: string; key: string } | null>(null);

  const getOrCreateKey = useCallback((signature: string) => {
    if (attemptRef.current?.signature === signature) return attemptRef.current.key;
    const key = crypto.randomUUID();
    attemptRef.current = { signature, key };
    return key;
  }, []);

  return useMutation({
    mutationFn: (input: SimulatePaymentInput) => {
      const idempotencyKey = getOrCreateKey(attemptSignature(input));
      return paymentService.simulate({ ...input, idempotencyKey });
    },
    onSuccess: (result) => {
      // Só limpa a tentativa quando o pagamento é de fato aprovado — uma
      // recusa mantém a reserva PENDING e o usuário pode tentar de novo
      // (inclusive repetir a mesma escolha, que deve reusar a chave).
      if (result.payment.status === "APPROVED") {
        attemptRef.current = null;
        void queryClient.invalidateQueries({ queryKey: MY_TICKETS_QUERY_KEY });
      }
      void queryClient.invalidateQueries({ queryKey: RESERVATIONS_QUERY_KEY });
    },
  });
}
