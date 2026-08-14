import { server } from "@/test/msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { TicketByCodeView } from "./TicketByCodeView";

function renderView(code: string) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TicketByCodeView code={code} />
    </QueryClientProvider>,
  );
}

describe("TicketByCodeView", () => {
  it("mostra uma tela útil de 'não encontrado' para código de ticket inexistente, sem travar a página", async () => {
    server.use(
      http.get("http://localhost:3000/api/tickets/TKT-ZZZZ", () =>
        HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "Ingresso não encontrado", requestId: "req-3" } },
          { status: 404 },
        ),
      ),
    );

    renderView("TKT-ZZZZ");

    expect(await screen.findByText(/não encontrado/i)).toBeInTheDocument();
  });

  it("renderiza evento, assento e QR quando o ingresso existe", async () => {
    server.use(
      http.get("http://localhost:3000/api/tickets/TKT-BOA", () =>
        HttpResponse.json({
          id: "t1",
          code: "TKT-BOA",
          status: "VALID",
          qrContent: "conteudo-assinado",
          seatLabel: "B2",
          usedAt: null,
          event: {
            id: "e1",
            title: "Clube da Luta",
            date: "2026-12-20T21:00:00.000Z",
            venue: "Cine Arena",
          },
        }),
      ),
    );

    renderView("TKT-BOA");

    expect(await screen.findByText("Clube da Luta")).toBeInTheDocument();
    expect(screen.getByText("B2")).toBeInTheDocument();
    expect(screen.getByText("TKT-BOA")).toBeInTheDocument();
  });
});
