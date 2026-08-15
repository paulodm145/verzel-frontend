import type { ReactElement } from "react";

import { server } from "@/test/msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor, within } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { PublicHome } from "./PublicHome";

// Mesma armadilha documentada em EventsExplorer.test: o axios do browser usa
// baseURL "/api/v" e o jsdom assume origem http://localhost:3000.
const EVENTS_URL = "http://localhost:3000/api/v/events";

function event(id: string, title: string, date: string | null) {
  return {
    id,
    organizerId: "org-1",
    sourceType: "MOVIE",
    externalId: id,
    title,
    description: null,
    imageUrl: null,
    date,
    venue: "Cine Arena",
    capacity: 30,
    price: 45,
    status: "PUBLISHED",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
}

function renderHome(ui: ReactElement) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("PublicHome", () => {
  it("destaca o evento que estreia primeiro, não o primeiro da resposta", async () => {
    server.use(
      http.get(EVENTS_URL, () =>
        HttpResponse.json({
          items: [
            event("2", "Estreia tardia", "2026-12-20T21:00:00.000Z"),
            event("1", "Estreia próxima", "2026-09-01T21:00:00.000Z"),
          ],
          total: 2,
          skip: 0,
          take: 10,
        }),
      ),
    );

    renderHome(<PublicHome />);

    // O <h1> é do hero: se a ordenação por data falhar, o destaque é o outro.
    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Estreia próxima");
  });

  it("lista os eventos na fileira do carrossel", async () => {
    server.use(
      http.get(EVENTS_URL, () =>
        HttpResponse.json({
          items: [
            event("1", "Clube da Luta", "2026-09-01T21:00:00.000Z"),
            event("2", "Show de Rock", "2026-10-01T21:00:00.000Z"),
          ],
          total: 2,
          skip: 0,
          take: 10,
        }),
      ),
    );

    renderHome(<PublicHome />);

    const row = await screen.findByRole("group", { name: "Estreia em breve" });
    expect(within(row).getByText("Clube da Luta")).toBeInTheDocument();
    expect(within(row).getByText("Show de Rock")).toBeInTheDocument();
  });

  it("empurra evento sem data para o fim em vez de descartá-lo", async () => {
    server.use(
      http.get(EVENTS_URL, () =>
        HttpResponse.json({
          items: [
            event("1", "Sessão sem data marcada", null),
            event("2", "Com data", "2026-09-01T21:00:00.000Z"),
          ],
          total: 2,
          skip: 0,
          take: 10,
        }),
      ),
    );

    renderHome(<PublicHome />);

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent("Com data");
    const row = screen.getByRole("group", { name: "Estreia em breve" });
    expect(within(row).getByText("Sessão sem data marcada")).toBeInTheDocument();
  });

  it("serve hero, fileira e programação com uma única requisição", async () => {
    let requestCount = 0;
    server.use(
      http.get(EVENTS_URL, () => {
        requestCount += 1;
        return HttpResponse.json({
          items: [event("1", "Clube da Luta", "2026-09-01T21:00:00.000Z")],
          total: 1,
          skip: 0,
          take: 10,
        });
      }),
    );

    renderHome(<PublicHome />);

    await screen.findByRole("group", { name: "Estreia em breve" });
    // O EventsExplorer abaixo usa o mesmo take, portanto a mesma chave de
    // Query — se alguém desalinhar HOME_TAKE do pageSize, isto vira 2.
    await waitFor(() => expect(requestCount).toBe(1));
  });
});
