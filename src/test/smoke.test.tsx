import { render, screen } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";

import { server } from "./msw";

describe("infraestrutura de testes", () => {
  it("renderiza um componente e reconhece o matcher do jest-dom", () => {
    render(<p>ping</p>);

    expect(screen.getByText("ping")).toBeInTheDocument();
  });

  it("intercepta uma requisição via MSW e devolve o corpo mockado", async () => {
    server.use(
      http.get("https://example.test/ping", () => {
        return HttpResponse.json({ pong: true });
      }),
    );

    const response = await fetch("https://example.test/ping");
    const body = await response.json();

    expect(body).toEqual({ pong: true });
  });
});
