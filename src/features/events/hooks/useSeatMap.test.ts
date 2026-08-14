import { describe, expect, it } from "vitest";

import { seatMapQueryOptions } from "./useSeatMap";

describe("seatMapQueryOptions", () => {
  it("usa staleTime 0 — mapa de assentos nunca serve do cache", () => {
    const options = seatMapQueryOptions("event-1");

    expect(options.staleTime).toBe(0);
  });

  it("fica desabilitada sem eventId", () => {
    const options = seatMapQueryOptions("");

    expect(options.enabled).toBe(false);
  });
});
