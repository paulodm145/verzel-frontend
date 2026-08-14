import { httpClient } from "@/lib/http-client";

import type { PaymentResult, SimulatePaymentInput, SimulatePaymentResult } from "../types";

function wasReplayed(headers: Record<string, unknown>): boolean {
  return headers["idempotency-replayed"] === "true";
}

export const paymentService = {
  async simulate(
    input: SimulatePaymentInput & { idempotencyKey: string },
  ): Promise<SimulatePaymentResult> {
    const { reservationId, paymentMethod, simulate, idempotencyKey } = input;

    const { data, headers } = await httpClient.post<PaymentResult>(
      `/reservations/${reservationId}/payment`,
      { paymentMethod, simulate },
      { headers: { "Idempotency-Key": idempotencyKey } },
    );

    return { payment: data, replayed: wasReplayed(headers) };
  },
};
