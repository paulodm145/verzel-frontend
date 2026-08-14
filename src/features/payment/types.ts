import type { ReservationStatus } from "@/features/reservations/types";

/** Espelha `POST /reservations/:id/payment` de `04-reserva-e-pagamento.md`. */
export type PaymentMethod = "CREDIT_CARD" | "PIX";
export type PaymentOutcome = "APPROVED" | "REFUSED";

export interface SimulatePaymentInput {
  reservationId: string;
  /** Padrão da API: `CREDIT_CARD`. */
  paymentMethod?: PaymentMethod;
  /** Padrão da API: `APPROVED`. Existe porque não há gateway real — é o
   * botão que demonstra o caminho da recusa. */
  simulate?: PaymentOutcome;
}

export interface PaymentResult {
  id: string;
  reservationId: string;
  status: PaymentOutcome;
  simulatedAt: string;
  /** `CONFIRMED` quando aprovado, `PENDING` quando recusado — a API nunca
   * cancela a reserva sozinha numa recusa. */
  reservationStatus: ReservationStatus;
}

export interface SimulatePaymentResult {
  payment: PaymentResult;
  replayed: boolean;
}
