import { server } from "@/test/msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { EventsExplorer } from "./EventsExplorer";

// Trap documentado no plano do epic: o axios do browser tem
// baseURL: "/api/v", e o jsdom deste projeto assume origem
// http://localhost:3000 — o handler precisa do caminho completo, não só
// "/events".
const EVENTS_URL = "http://localhost:3000/api/v/events";

function renderWithClient(ui: React.ReactElement) {
  // retry: false — sem isso, uma falha de asserção de rede vira um teste
  // lento em vez de um teste vermelho.
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("EventsExplorer", () => {
  it("digitar rápido no filtro gera uma única requisição, não uma por tecla", async () => {
    const searchTermsRecebidos: string[] = [];
    server.use(
      http.get(EVENTS_URL, ({ request }) => {
        searchTermsRecebidos.push(new URL(request.url).searchParams.get("search") ?? "");
        return HttpResponse.json({ items: [], total: 0, skip: 0, take: 20 });
      }),
    );

    renderWithClient(<EventsExplorer />);

    // Busca inicial (sem termo, ao montar) não deve contar no total abaixo.
    await waitFor(() => expect(searchTermsRecebidos).toHaveLength(1));

    const input = screen.getByPlaceholderText("Buscar eventos...");
    fireEvent.change(input, { target: { value: "c" } });
    fireEvent.change(input, { target: { value: "cl" } });
    fireEvent.change(input, { target: { value: "clu" } });
    fireEvent.change(input, { target: { value: "clube" } });

    await waitFor(() => expect(searchTermsRecebidos).toHaveLength(2), { timeout: 1500 });

    // Só o valor final chegou ao servidor — nada das teclas intermediárias.
    expect(searchTermsRecebidos).toEqual(["", "clube"]);
  });

  it("mostra o estado vazio quando a API devolve zero itens", async () => {
    server.use(
      http.get(EVENTS_URL, () => HttpResponse.json({ items: [], total: 0, skip: 0, take: 20 })),
    );

    renderWithClient(<EventsExplorer />);

    expect(await screen.findByText("Nenhum evento encontrado")).toBeInTheDocument();
  });
});
