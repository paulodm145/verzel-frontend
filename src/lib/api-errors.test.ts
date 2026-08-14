import { describe, expect, it } from "vitest";

import { ApiError, isApiError, parseApiError } from "./api-errors";

describe("parseApiError", () => {
  it("extrai code, message, details e requestId do formato da API", () => {
    const erro = parseApiError(400, {
      error: {
        code: "VALIDATION_ERROR",
        message: "Dados de entrada inválidos",
        details: [{ path: "email", message: "Invalid email address" }],
        requestId: "4a39b172-b2b3-4df5-a572-a304ce067f62",
      },
    });

    expect(erro.status).toBe(400);
    expect(erro.code).toBe("VALIDATION_ERROR");
    expect(erro.message).toBe("Dados de entrada inválidos");
    expect(erro.details).toEqual([{ path: "email", message: "Invalid email address" }]);
    expect(erro.requestId).toBe("4a39b172-b2b3-4df5-a572-a304ce067f62");
  });

  it("usa fallback quando o corpo não segue o formato esperado", () => {
    const erro = parseApiError(502, "<html>Bad Gateway</html>");

    expect(erro.status).toBe(502);
    expect(erro.code).toBe("UNKNOWN");
    expect(erro.message).toBe("Falha inesperada ao falar com o servidor");
    expect(erro.details).toBeUndefined();
  });

  it("não inventa details quando o campo não é uma lista", () => {
    const erro = parseApiError(400, { error: { code: "X", message: "m", details: "nope" } });

    expect(erro.details).toBeUndefined();
  });
});

describe("isApiError", () => {
  it("reconhece um ApiError", () => {
    expect(isApiError(new ApiError(404, "NOT_FOUND", "não achei"))).toBe(true);
  });

  it("rejeita um Error comum", () => {
    expect(isApiError(new Error("qualquer"))).toBe(false);
  });
});
