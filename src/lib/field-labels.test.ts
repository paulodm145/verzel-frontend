import { describe, expect, it } from "vitest";

import { labelForPath } from "./field-labels";

describe("labelForPath", () => {
  it("traduz um campo conhecido", () => {
    expect(labelForPath("email")).toBe("E-mail");
  });

  it("resolve notação de ponto pelo último segmento", () => {
    expect(labelForPath("event.price")).toBe("Preço");
  });

  it("traduz o corpo ausente para algo legível", () => {
    expect(labelForPath("(corpo)")).toBe("Formulário");
  });

  it("devolve o próprio path quando não conhece o campo", () => {
    expect(labelForPath("campoDesconhecido")).toBe("campoDesconhecido");
  });
});
