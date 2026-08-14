import type { ReactNode } from "react";

import { server } from "@/test/msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { useValidateTicket } from "./useValidateTicket";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useValidateTicket", () => {
  it("resolve sem lançar quando a API reporta um ingresso inválido (200 com result: INVALID)", async () => {
    server.use(
      http.post("http://localhost:3000/api/v/gate/validate", () =>
        HttpResponse.json({
          result: "INVALID",
          message: "Assinatura não confere",
          ticket: null,
          usedAt: null,
        }),
      ),
    );

    const { result } = renderHook(() => useValidateTicket(), { wrapper });

    const outcome = await result.current.mutateAsync({
      eventId: "evento-1",
      code: "TKT-AAAA-BBBB-CCCC",
    });

    expect(outcome.result).toBe("INVALID");
    expect(result.current.isError).toBe(false);
  });

  it("resolve sem lançar para ALREADY_USED e WRONG_EVENT também — são resultados, não erros", async () => {
    server.use(
      http.post("http://localhost:3000/api/v/gate/validate", () =>
        HttpResponse.json({
          result: "ALREADY_USED",
          message: "Já entrou às 20:58",
          ticket: { code: "TKT-AAAA-BBBB-CCCC", seatLabel: "A1", eventTitle: "Show" },
          usedAt: "2026-08-13T20:58:00.000Z",
        }),
      ),
    );

    const { result } = renderHook(() => useValidateTicket(), { wrapper });

    await expect(
      result.current.mutateAsync({ eventId: "evento-1", qrContent: "conteudo-assinado" }),
    ).resolves.toMatchObject({ result: "ALREADY_USED" });
  });

  it("rejeita numa falha de rede real, distinta de um resultado de validação", async () => {
    server.use(http.post("http://localhost:3000/api/v/gate/validate", () => HttpResponse.error()));

    const { result } = renderHook(() => useValidateTicket(), { wrapper });

    await expect(
      result.current.mutateAsync({ eventId: "evento-1", code: "TKT-AAAA-BBBB-CCCC" }),
    ).rejects.toBeTruthy();

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it("rejeita num 403 de papel incorreto — erro real de uso da API, não um resultado", async () => {
    server.use(
      http.post("http://localhost:3000/api/v/gate/validate", () =>
        HttpResponse.json(
          { error: { code: "FORBIDDEN", message: "Sem permissão", requestId: "req-1" } },
          { status: 403 },
        ),
      ),
    );

    const { result } = renderHook(() => useValidateTicket(), { wrapper });

    await expect(
      result.current.mutateAsync({ eventId: "evento-1", code: "TKT-AAAA-BBBB-CCCC" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
