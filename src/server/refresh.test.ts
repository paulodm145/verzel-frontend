import { server } from "@/test/msw";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { renewSession } from "./refresh";

describe("renewSession", () => {
  it("duas chamadas concorrentes com o mesmo refreshToken geram um único POST", async () => {
    // Este é o teste que mais importa no epic: sem single-flight, a segunda
    // chamada reapresentaria o token já consumido pela primeira e a API
    // trataria como roubo, derrubando todas as sessões do usuário.
    let calls = 0;
    server.use(
      http.post("http://localhost:3000/auth/refresh", async () => {
        calls += 1;
        return HttpResponse.json({
          accessToken: "novo-at",
          refreshToken: "novo-rt",
          expiresIn: 900,
        });
      }),
    );

    const [a, b] = await Promise.all([
      renewSession("token-concorrente"),
      renewSession("token-concorrente"),
    ]);

    expect(calls).toBe(1);
    expect(a).toEqual(b);
    expect(a).toEqual({ accessToken: "novo-at", refreshToken: "novo-rt", expiresIn: 900 });
  });

  it("refreshTokens diferentes não compartilham a mesma promessa", async () => {
    let calls = 0;
    server.use(
      http.post("http://localhost:3000/auth/refresh", async () => {
        calls += 1;
        return HttpResponse.json({
          accessToken: `at-${calls}`,
          refreshToken: `rt-${calls}`,
          expiresIn: 900,
        });
      }),
    );

    await Promise.all([renewSession("token-a"), renewSession("token-b")]);

    expect(calls).toBe(2);
  });

  it("chamada seguinte, após a anterior terminar, dispara um novo POST", async () => {
    let calls = 0;
    server.use(
      http.post("http://localhost:3000/auth/refresh", async () => {
        calls += 1;
        return HttpResponse.json({
          accessToken: `at-${calls}`,
          refreshToken: `rt-${calls}`,
          expiresIn: 900,
        });
      }),
    );

    await renewSession("token-sequencial");
    await renewSession("token-sequencial");

    // A entrada no mapa de single-flight é removida ao terminar (.finally),
    // então uma segunda renovação legítima do mesmo token (ex.: expirou de
    // novo depois) não fica presa para sempre.
    expect(calls).toBe(2);
  });
});
