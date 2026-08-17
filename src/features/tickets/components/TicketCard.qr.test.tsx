import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TicketCard } from "./TicketCard";

// Captura o que chega ao QR sem depender do SVG desenhado: o valor é o
// contrato, o desenho é do qrcode.react.
const { qrValues } = vi.hoisted(() => ({ qrValues: [] as string[] }));
vi.mock("qrcode.react", () => ({
  QRCodeSVG: ({ value }: { value: string }) => {
    qrValues.push(value);
    return <svg data-testid="qr" />;
  },
}));

const CODE = "TKT-FAGN-VA5K-HUD5";

const ticket = {
  id: "t-1",
  code: CODE,
  status: "VALID" as const,
  qrContent: "eyJ0aWNrZXRJZCI6IjA0NDNkNzI2In0.assinatura",
  seatLabel: "A3",
  usedAt: null,
  event: {
    id: "e-1",
    title: "Uma Grande Aventura",
    date: "2026-08-26T18:00:00.000Z",
    venue: "Cine Arena",
  },
  shareUrl: "https://verzel-api.paulorb.dev/tickets/TKT-FAGN-VA5K-HUD5",
};

/**
 * O QR carrega a URL pública do ingresso, não o token assinado. A razão é
 * prática e foi decidida no uso: a câmera nativa do celular só sabe o que
 * fazer com uma URL — apontada para um token, mostra uma cadeia opaca e a
 * pessoa conclui que o sistema não funciona.
 *
 * A portaria continua validando porque extrai o código da URL lida
 * (ver check-in/lib/scanned-value.ts) e o endpoint aceita `code`.
 */
describe("TicketCard — conteúdo do QR", () => {
  it("desenha a URL pública do ingresso, não o token assinado", () => {
    qrValues.length = 0;
    render(<TicketCard ticket={ticket} />);

    expect(screen.getByTestId("qr")).toBeInTheDocument();
    expect(qrValues).toHaveLength(1);
    expect(qrValues[0]).toBe(`http://localhost:3000/ticket/${CODE}`);
    expect(qrValues[0]).not.toContain(ticket.qrContent);
    // Nunca a URL da API: aquela responde JSON.
    expect(qrValues[0]).not.toContain("verzel-api");
  });
});
