import { server } from "@/test/msw";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { paymentService } from "./payment-service";

const RESERVATION_ID = "reserva-1";

function paymentBody(status: "APPROVED" | "REFUSED") {
  return {
    id: "pagamento-1",
    reservationId: RESERVATION_ID,
    status,
    simulatedAt: new Date().toISOString(),
    reservationStatus: status === "APPROVED" ? "CONFIRMED" : "PENDING",
  };
}

describe("paymentService.simulate", () => {
  it("replayed: false quando o cabeçalho Idempotency-Replayed não vem", async () => {
    server.use(
      http.post(`http://localhost:3000/api/v/reservations/${RESERVATION_ID}/payment`, () =>
        HttpResponse.json(paymentBody("APPROVED")),
      ),
    );

    const result = await paymentService.simulate({
      reservationId: RESERVATION_ID,
      simulate: "APPROVED",
      idempotencyKey: "chave-1",
    });

    expect(result.replayed).toBe(false);
    expect(result.payment.status).toBe("APPROVED");
  });

  it("replayed: true quando a API reproduz a resposta de uma tentativa anterior", async () => {
    server.use(
      http.post(`http://localhost:3000/api/v/reservations/${RESERVATION_ID}/payment`, () =>
        HttpResponse.json(paymentBody("APPROVED"), {
          headers: { "Idempotency-Replayed": "true" },
        }),
      ),
    );

    const result = await paymentService.simulate({
      reservationId: RESERVATION_ID,
      simulate: "APPROVED",
      idempotencyKey: "chave-1",
    });

    expect(result.replayed).toBe(true);
  });
});
