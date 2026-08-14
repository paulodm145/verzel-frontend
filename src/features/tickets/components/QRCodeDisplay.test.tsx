import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

// `qrcode.react` desenha em módulos de pixel — não dá para "ler" o SVG de
// volta num teste. O que importa verificar é o contrato: o `value` que
// chega até o `QRCodeSVG` é exatamente o `qrContent` da API, não algo
// recomposto no cliente (ex.: `${code}-${eventId}`). Um stub que expõe os
// props recebidos como atributos prova isso sem precisar decodificar nada.
vi.mock("qrcode.react", () => ({
  QRCodeSVG: (props: { value: string; size: number; level: string; marginSize: number }) => (
    <svg
      data-testid="qr-stub"
      data-value={props.value}
      data-size={props.size}
      data-level={props.level}
      data-margin={props.marginSize}
    />
  ),
}));

const { QRCodeDisplay } = await import("./QRCodeDisplay");

describe("QRCodeDisplay", () => {
  it("passa o qrContent da API para o QRCodeSVG sem transformar", () => {
    const qrContent = "eyJ0aWNrZXRJZCI6ImFiYyJ9.assinatura";
    render(<QRCodeDisplay value={qrContent} />);

    const stub = screen.getByTestId("qr-stub");
    expect(stub).toHaveAttribute("data-value", qrContent);
  });

  it("usa level M e marginSize 4, conforme 05-ingressos-e-portaria.md", () => {
    render(<QRCodeDisplay value="conteudo" />);

    const stub = screen.getByTestId("qr-stub");
    expect(stub).toHaveAttribute("data-level", "M");
    expect(stub).toHaveAttribute("data-margin", "4");
  });

  it("renderiza entre 256 e 320px por padrão", () => {
    render(<QRCodeDisplay value="conteudo" />);

    const stub = screen.getByTestId("qr-stub");
    const size = Number(stub.getAttribute("data-size"));
    expect(size).toBeGreaterThanOrEqual(256);
    expect(size).toBeLessThanOrEqual(320);
  });
});
