import { describe, expect, it } from "vitest";

import { safeNextPath } from "./safe-next-path";

describe("safeNextPath", () => {
  it("preserva um destino interno com query string", () => {
    expect(safeNextPath("/events/evento-1/checkout?seat=A1")).toBe(
      "/events/evento-1/checkout?seat=A1",
    );
  });

  it.each([undefined, "", "https://evil.example", "//evil.example/path"])(
    "rejeita destino externo ou inválido: %s",
    (value) => expect(safeNextPath(value)).toBeUndefined(),
  );
});
