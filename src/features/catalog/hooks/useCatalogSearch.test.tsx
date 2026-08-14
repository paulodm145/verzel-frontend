import type { ReactNode } from "react";

import { server } from "@/test/msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useCatalogSearch } from "./useCatalogSearch";

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe("useCatalogSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("manda page=1 na primeira página — não skip=0", async () => {
    let capturedUrl: URL | undefined;
    server.use(
      http.get("http://localhost:3000/api/v/catalog/search", ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({ items: [] });
      }),
    );

    const { result, rerender } = renderHook(({ query }) => useCatalogSearch(query, 1), {
      wrapper,
      initialProps: { query: "clube da luta" },
    });

    await vi.advanceTimersByTimeAsync(400);
    rerender({ query: "clube da luta" });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(capturedUrl?.searchParams.get("page")).toBe("1");
    expect(capturedUrl?.searchParams.has("skip")).toBe(false);
  });

  it("não dispara chamada abaixo de 2 caracteres", async () => {
    const handler = vi.fn(() => HttpResponse.json({ items: [] }));
    server.use(http.get("http://localhost:3000/api/v/catalog/search", handler));

    renderHook(() => useCatalogSearch("a", 1), { wrapper });

    await vi.advanceTimersByTimeAsync(1000);

    expect(handler).not.toHaveBeenCalled();
  });

  it("digitação rápida gera uma única requisição, não uma por tecla", async () => {
    const handler = vi.fn(() => HttpResponse.json({ items: [] }));
    server.use(http.get("http://localhost:3000/api/v/catalog/search", handler));

    const { rerender } = renderHook(({ query }) => useCatalogSearch(query, 1), {
      wrapper,
      initialProps: { query: "c" },
    });

    // Simula digitação: cada letra chega antes do debounce da anterior vencer.
    for (const query of ["cl", "clu", "club", "clube"]) {
      await vi.advanceTimersByTimeAsync(100);
      rerender({ query });
    }

    await vi.advanceTimersByTimeAsync(400);

    await waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
  });
});
