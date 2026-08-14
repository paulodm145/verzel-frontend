/** Espelha `Reservation` de `04-reserva-e-pagamento.md`. */
export type ReservationStatus = "PENDING" | "CONFIRMED" | "EXPIRED" | "CANCELED";

export interface Reservation {
  id: string;
  eventId: string;
  customerId: string;
  seatId: string;
  seatLabel: string;
  status: ReservationStatus;
  expiresAt: string;
  createdAt: string;
}

export interface ReservationListResponse {
  items: Reservation[];
  total: number;
  skip: number;
  take: number;
}

export interface CreateReservationInput {
  eventId: string;
  seatId: string;
  idempotencyKey: string;
}

/** `Idempotency-Replayed` vem exposto na resposta — ver 06-erros-e-convencoes.md. */
export interface CreateReservationResult {
  reservation: Reservation;
  replayed: boolean;
}
