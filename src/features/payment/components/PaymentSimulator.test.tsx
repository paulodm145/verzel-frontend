import type { ReactNode } from "react";

import { server } from "@/test/msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { PaymentSimulator } from "./PaymentSimulator";

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

function renderSimulator(onApproved = vi.fn()) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  }
  render(<PaymentSimulator reservationId={RESERVATION_ID} onApproved={onApproved} />, {
    wrapper: Wrapper,
  });
  return { client, onApproved };
}

describe("PaymentSimulator", () => {
  it("mostra o aviso de sucesso quando a resposta não é reproduzida", async () => {
    server.use(
      http.post(`http://localhost:3000/api/v/reservations/${RESERVATION_ID}/payment`, () =>
        HttpResponse.json(paymentBody("APPROVED")),
      ),
    );
    const { onApproved } = renderSimulator();

    fireEvent.click(screen.getByRole("button", { name: "Aprovar pagamento" }));

    expect(await screen.findByRole("status")).toHaveTextContent("Pagamento aprovado");
    expect(onApproved).toHaveBeenCalledTimes(1);
  });

  it("invalida Meus ingressos quando o pagamento é aprovado", async () => {
    server.use(
      http.post(`http://localhost:3000/api/v/reservations/${RESERVATION_ID}/payment`, () =>
        HttpResponse.json(paymentBody("APPROVED")),
      ),
    );
    const { client, onApproved } = renderSimulator();
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    fireEvent.click(screen.getByRole("button", { name: "Aprovar pagamento" }));

    await waitFor(() => expect(onApproved).toHaveBeenCalledTimes(1));
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["tickets", "mine"] });
  });

  it("suprime o aviso quando Idempotency-Replayed: true — o resultado ainda se aplica", async () => {
    server.use(
      http.post(`http://localhost:3000/api/v/reservations/${RESERVATION_ID}/payment`, () =>
        HttpResponse.json(paymentBody("APPROVED"), {
          headers: { "Idempotency-Replayed": "true" },
        }),
      ),
    );
    const { onApproved } = renderSimulator();

    fireEvent.click(screen.getByRole("button", { name: "Aprovar pagamento" }));

    // onApproved é chamado normalmente — a reserva de fato foi confirmada —
    // só o toast de sucesso, que seria redundante, não aparece.
    await waitFor(() => expect(onApproved).toHaveBeenCalledTimes(1));
    expect(screen.queryByRole("status")).toBeNull();
  });
});
