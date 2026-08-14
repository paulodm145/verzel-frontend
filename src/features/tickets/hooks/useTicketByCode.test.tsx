import type { ReactNode } from "react";

import { server } from "@/test/msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { useTicketByCode } from "./useTicketByCode";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useTicketByCode", () => {
  it("resolve com o ingresso quando o código existe — via passthrough público, sem cookie de sessão", async () => {
    server.use(
      http.get("http://localhost:3000/api/tickets/TKT-VALIDO", () =>
        HttpResponse.json({
          id: "t1",
          code: "TKT-VALIDO",
          status: "VALID",
          qrContent: "conteudo-assinado",
          seatLabel: "A1",
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

    const { result } = renderHook(() => useTicketByCode("TKT-VALIDO"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.code).toBe("TKT-VALIDO");
  });

  it("resolve com null (não lança) para um código inexistente — 404 é estado normal, não crash", async () => {
    server.use(
      http.get("http://localhost:3000/api/tickets/TKT-INEXISTENTE", () =>
        HttpResponse.json(
          { error: { code: "NOT_FOUND", message: "Ingresso não encontrado", requestId: "req-1" } },
          { status: 404 },
        ),
      ),
    );

    const { result } = renderHook(() => useTicketByCode("TKT-INEXISTENTE"), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it("propaga uma falha real (500) como erro, distinta de um 404", async () => {
    server.use(
      http.get("http://localhost:3000/api/tickets/TKT-ERRO", () =>
        HttpResponse.json(
          { error: { code: "INTERNAL_ERROR", message: "Falha interna", requestId: "req-2" } },
          { status: 500 },
        ),
      ),
    );

    const { result } = renderHook(() => useTicketByCode("TKT-ERRO"), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
