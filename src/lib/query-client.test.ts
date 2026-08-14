import { describe, expect, it } from "vitest";

import { ApiError } from "./api-errors";
import { createQueryClient, STALE_TIME } from "./query-client";

describe("STALE_TIME", () => {
  it("mantém o mapa de assentos sempre fresco", () => {
    // Assento cacheado é o usuário clicando num lugar já vendido.
    expect(STALE_TIME.seats).toBe(0);
  });

  it("segue a tabela do 07-performance.md", () => {
    expect(STALE_TIME.events).toBe(60_000);
    expect(STALE_TIME.eventDetail).toBe(60_000);
    expect(STALE_TIME.reservations).toBe(0);
    expect(STALE_TIME.tickets).toBe(30_000);
    expect(STALE_TIME.catalog).toBe(300_000);
  });
});

describe("createQueryClient", () => {
  const retry = () => {
    const client = createQueryClient();
    return client.getDefaultOptions().queries?.retry as (
      failureCount: number,
      error: Error,
    ) => boolean;
  };

  it("não repete requisição que falhou por erro do cliente", () => {
    expect(retry()(0, new ApiError(403, "FORBIDDEN", "sem permissão"))).toBe(false);
    expect(retry()(0, new ApiError(404, "NOT_FOUND", "não achei"))).toBe(false);
  });

  it("repete erro de servidor até duas vezes", () => {
    const erro = new ApiError(500, "INTERNAL_ERROR", "falhou");
    expect(retry()(0, erro)).toBe(true);
    expect(retry()(1, erro)).toBe(true);
    expect(retry()(2, erro)).toBe(false);
  });

  it("repete erro de rede, que não é ApiError", () => {
    expect(retry()(0, new Error("Network Error"))).toBe(true);
  });
});
