import { NextRequest } from "next/server";

import { server } from "@/test/msw";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { proxyToApi } from "./proxy";

const USER_COOKIE = encodeURIComponent(JSON.stringify({ id: "u1", name: "Ana", role: "CUSTOMER" }));

function buildRequest(
  path: string,
  options: {
    method?: string;
    cookies?: Record<string, string>;
    headers?: Record<string, string>;
    body?: string;
  } = {},
): NextRequest {
  const cookieHeader = Object.entries(options.cookies ?? {})
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");

  return new NextRequest(`http://localhost:3001/api/v${path}`, {
    method: options.method ?? "GET",
    headers: { cookie: cookieHeader, ...options.headers },
    body: options.body,
  });
}

describe("proxyToApi", () => {
  it("renova antes de encaminhar quando vz_renew_at já venceu", async () => {
    let refreshCalls = 0;
    let authorizationRecebida: string | null = null;

    server.use(
      http.post("http://localhost:3000/auth/refresh", async () => {
        refreshCalls += 1;
        return HttpResponse.json({
          accessToken: "at-novo",
          refreshToken: "rt-novo",
          expiresIn: 900,
        });
      }),
      http.get("http://localhost:3000/events", ({ request }) => {
        authorizationRecebida = request.headers.get("authorization");
        return HttpResponse.json({ items: [], total: 0, skip: 0, take: 20 });
      }),
    );

    const request = buildRequest("/events", {
      cookies: {
        vz_at: "at-velho",
        vz_rt: "rt-velho",
        vz_renew_at: String(Date.now() - 1000),
        vz_user: USER_COOKIE,
      },
    });

    const response = await proxyToApi(request, ["events"]);

    expect(refreshCalls).toBe(1);
    expect(authorizationRecebida).toBe("Bearer at-novo");
    expect(response.status).toBe(200);
    expect(response.cookies.get("vz_at")?.value).toBe("at-novo");
  });

  it("403 nunca dispara renovação", async () => {
    let refreshCalls = 0;

    server.use(
      http.post("http://localhost:3000/auth/refresh", () => {
        refreshCalls += 1;
        return HttpResponse.json({ accessToken: "x", refreshToken: "y", expiresIn: 900 });
      }),
      http.get("http://localhost:3000/dashboard-data", () =>
        HttpResponse.json(
          { error: { code: "FORBIDDEN", message: "sem permissão" } },
          { status: 403 },
        ),
      ),
    );

    const request = buildRequest("/dashboard-data", {
      cookies: {
        vz_at: "at-valido",
        vz_rt: "rt-valido",
        // ainda longe do vencimento — renovação proativa não deveria entrar em ação
        vz_renew_at: String(Date.now() + 60_000),
        vz_user: USER_COOKIE,
      },
    });

    const response = await proxyToApi(request, ["dashboard-data"]);

    expect(refreshCalls).toBe(0);
    expect(response.status).toBe(403);
  });

  it("repassa Idempotency-Key na ida e expõe Idempotency-Replayed na volta", async () => {
    let idempotencyKeyRecebida: string | null = null;

    server.use(
      http.post("http://localhost:3000/reservations", ({ request }) => {
        idempotencyKeyRecebida = request.headers.get("idempotency-key");
        return HttpResponse.json(
          { id: "res-1" },
          { status: 201, headers: { "Idempotency-Replayed": "true" } },
        );
      }),
    );

    const request = buildRequest("/reservations", {
      method: "POST",
      cookies: {
        vz_at: "at-valido",
        vz_rt: "rt-valido",
        vz_renew_at: String(Date.now() + 60_000),
        vz_user: USER_COOKIE,
      },
      headers: { "content-type": "application/json", "idempotency-key": "chave-123" },
      body: JSON.stringify({ seatId: "seat-1" }),
    });

    const response = await proxyToApi(request, ["reservations"]);

    expect(idempotencyKeyRecebida).toBe("chave-123");
    expect(response.headers.get("idempotency-replayed")).toBe("true");
  });

  it("não repassa cabeçalhos fora da allowlist", async () => {
    let xCustomRecebido: string | null = "não deveria mudar";

    server.use(
      http.get("http://localhost:3000/events", ({ request }) => {
        xCustomRecebido = request.headers.get("x-custom-header");
        return HttpResponse.json({ items: [], total: 0, skip: 0, take: 20 });
      }),
    );

    const request = buildRequest("/events", {
      cookies: {
        vz_at: "at-valido",
        vz_rt: "rt-valido",
        vz_renew_at: String(Date.now() + 60_000),
        vz_user: USER_COOKIE,
      },
      headers: { "x-custom-header": "deveria-sumir" },
    });

    await proxyToApi(request, ["events"]);

    expect(xCustomRecebido).toBeNull();
  });

  it("sem accessToken responde 401 sem chamar a API", async () => {
    let apiChamada = false;
    server.use(
      http.get("http://localhost:3000/events", () => {
        apiChamada = true;
        return HttpResponse.json({ items: [], total: 0, skip: 0, take: 20 });
      }),
    );

    const request = buildRequest("/events", {});
    const response = await proxyToApi(request, ["events"]);

    expect(response.status).toBe(401);
    expect(apiChamada).toBe(false);
  });
});
