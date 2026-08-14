import { server } from "@/test/msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { MyTicketsScreen } from "./MyTicketsScreen";

function makeTicket(id: string) {
  return {
    id,
    code: `TKT-AAAA-BBBB-${id}`,
    status: "VALID" as const,
    qrContent: `qr-conteudo-${id}`,
    seatLabel: "A1",
    usedAt: null,
    event: {
      id: "evento-1",
      title: "Clube da Luta — Sessão Especial",
      date: "2026-12-20T21:00:00.000Z",
      venue: "Cine Arena",
    },
    shareUrl: `http://localhost:3000/tickets/TKT-AAAA-BBBB-${id}`,
  };
}

function renderScreen() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <MyTicketsScreen />
    </QueryClientProvider>,
  );
}

describe("MyTicketsScreen", () => {
  it("renderiza vários ingressos com exatamente UMA requisição — o evento já vem embutido", async () => {
    let requestCount = 0;
    // Nenhum handler para /events/:id: se o componente tentasse buscar o
    // evento por fora, o MSW rejeitaria a requisição não mapeada e o teste
    // falharia sozinho (server.listen com onUnhandledRequest: "error").
    server.use(
      http.get("http://localhost:3000/api/v/tickets/mine", () => {
        requestCount += 1;
        return HttpResponse.json({
          items: [makeTicket("1"), makeTicket("2"), makeTicket("3")],
          total: 3,
          skip: 0,
          take: 20,
        });
      }),
    );

    renderScreen();

    await waitFor(() => {
      expect(screen.getAllByText("Clube da Luta — Sessão Especial")).toHaveLength(3);
    });

    expect(requestCount).toBe(1);
  });

  it("mostra estado vazio quando não há ingressos", async () => {
    server.use(
      http.get("http://localhost:3000/api/v/tickets/mine", () =>
        HttpResponse.json({ items: [], total: 0, skip: 0, take: 20 }),
      ),
    );

    renderScreen();

    expect(await screen.findByText("Você ainda não tem ingressos.")).toBeInTheDocument();
  });

  it("mostra a message da API e o requestId em erro", async () => {
    server.use(
      http.get("http://localhost:3000/api/v/tickets/mine", () =>
        HttpResponse.json(
          {
            error: {
              code: "INTERNAL_ERROR",
              message: "Falha ao buscar ingressos",
              requestId: "req-9",
            },
          },
          { status: 500 },
        ),
      ),
    );

    renderScreen();

    expect(await screen.findByText("Falha ao buscar ingressos")).toBeInTheDocument();
    expect(screen.getByText(/req-9/)).toBeInTheDocument();
  });
});
