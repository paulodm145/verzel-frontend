import { describe, expect, it } from "vitest";

import { labelForPath, translateValidationDetail } from "./field-labels";

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

describe("translateValidationDetail", () => {
  it("nunca repassa a frase original do Zod", () => {
    const traduzida = translateValidationDetail(
      "password",
      "Too small: expected string to have >=8 characters",
    );

    expect(traduzida).not.toMatch(/Too small|characters/i);
    expect(traduzida).toContain("Senha");
    expect(traduzida).toContain("8");
  });

  it("traduz e-mail inválido pelo rótulo do campo", () => {
    expect(translateValidationDetail("email", "Invalid email address")).toBe(
      "E-mail: formato de e-mail inválido.",
    );
  });

  it("traduz campo ausente", () => {
    expect(translateValidationDetail("name", "Required")).toBe("Nome é obrigatório.");
  });
});
