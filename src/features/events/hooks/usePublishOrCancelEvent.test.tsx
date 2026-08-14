import type { ReactNode } from "react";

import { server } from "@/test/msw";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";

import { usePublishEvent } from "./usePublishOrCancelEvent";

describe("usePublishEvent", () => {
  it("invalida a query de eventos após publicar, para a listagem pública refletir a mudança", async () => {
    server.use(
      http.post("http://localhost:3000/api/v/events/evento-1/publish", () =>
        HttpResponse.json({ id: "evento-1", status: "PUBLISHED" }),
      ),
    );

    const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(client, "invalidateQueries");

    function wrapper({ children }: { children: ReactNode }) {
      return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    }

    const { result } = renderHook(() => usePublishEvent(), { wrapper });

    result.current.mutate("evento-1");

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: ["events"] });
  });
});
