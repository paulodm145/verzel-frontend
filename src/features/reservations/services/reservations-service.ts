/**
 * Serviço de reservas. Fala com `/api/v/*` via `httpClient` — o proxy do BFF
 * já injeta o Bearer e repassa `Idempotency-Key`/`Idempotency-Replayed`
 * (server/proxy.ts, allowlist de cabeçalhos).
 */
import { httpClient } from "@/lib/http-client";

import type {
  CreateReservationInput,
  CreateReservationResult,
  Reservation,
  ReservationListResponse,
} from "../types";

/** `axios` sempre normaliza nomes de cabeçalho de resposta para minúsculo. */
function wasReplayed(headers: Record<string, unknown>): boolean {
  return headers["idempotency-replayed"] === "true";
}

export const reservationsService = {
  async create({
    eventId,
    seatId,
    idempotencyKey,
  }: CreateReservationInput): Promise<CreateReservationResult> {
    const { data, headers } = await httpClient.post<Reservation>(
      `/events/${eventId}/reservations`,
      { seatId },
      { headers: { "Idempotency-Key": idempotencyKey } },
    );
    return { reservation: data, replayed: wasReplayed(headers) };
  },

  async listMine(params: { skip?: number; take?: number } = {}): Promise<ReservationListResponse> {
    const { data } = await httpClient.get<ReservationListResponse>("/reservations/mine", {
      params,
    });
    return data;
  },

  /** Cancela a própria reserva pendente e libera o assento na hora. Sem
   * Idempotency-Key — não é exigida pela API para este endpoint. */
  async cancel(id: string): Promise<Reservation> {
    const { data } = await httpClient.delete<Reservation>(`/reservations/${id}`);
    return data;
  },
};
