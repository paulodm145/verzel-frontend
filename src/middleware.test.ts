import { NextRequest } from "next/server";

import { describe, expect, it } from "vitest";

import { proxy } from "./proxy";

function buildRequest(pathname: string, userCookie?: string): NextRequest {
  const cookie = userCookie !== undefined ? `vz_user=${userCookie}` : "";
  return new NextRequest(`http://localhost:3001${pathname}`, { headers: { cookie } });
}

describe("proxy de rotas", () => {
  it("cookie vz_user adulterado (JSON quebrado) não derruba o proxy e trata como visitante", () => {
    const request = buildRequest("/dashboard", "{isso não é json");

    expect(() => proxy(request)).not.toThrow();
    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("cookie vz_user com role fora do enum não derruba o proxy", () => {
    const request = buildRequest(
      "/dashboard",
      JSON.stringify({ id: "u1", name: "Ana", role: "SUPER_ADMIN" }),
    );

    const response = proxy(request);
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toContain("/login");
  });

  it("rota protegida sem cookie nenhum redireciona para /login?next=<rota>", () => {
    const request = buildRequest("/dashboard/123");
    const response = proxy(request);

    expect(response.headers.get("location")).toBe(
      "http://localhost:3001/login?next=%2Fdashboard%2F123",
    );
  });

  it("sessão válida com papel errado vai para /403, nunca para o login", () => {
    const user = JSON.stringify({ id: "u1", name: "Caio Cliente", role: "CUSTOMER" });
    const request = buildRequest("/dashboard", user);

    const response = proxy(request);
    expect(response.headers.get("location")).toBe("http://localhost:3001/403");
  });

  it("sessão válida com o papel certo segue em frente", () => {
    const user = JSON.stringify({ id: "u1", name: "Léo Organizador", role: "ORGANIZER" });
    const request = buildRequest("/dashboard", user);

    const response = proxy(request);
    expect(response.headers.get("location")).toBeNull();
  });

  it("rota pública não aciona nenhuma regra", () => {
    const request = buildRequest("/ticket/TKT-ABCD-1234-EFGH");
    const response = proxy(request);

    expect(response.headers.get("location")).toBeNull();
  });
});
