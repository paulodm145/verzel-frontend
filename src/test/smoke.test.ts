import { describe, expect, it } from "vitest";

describe("infraestrutura de testes", () => {
  it("roda com jsdom disponível", () => {
    expect(typeof document).toBe("object");
  });
});
