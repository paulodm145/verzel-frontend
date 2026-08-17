import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TicketCard } from "./TicketCard";

const CODE = "TKT-FAGN-VA5K-HUD5";

const ticket = {
  id: "0443d726-1a10-48a0-8e24-fe400fb08233",
  code: CODE,
  status: "VALID" as const,
  qrContent: "conteudo-assinado",
  seatLabel: "A3",
  usedAt: null,
  event: {
    id: "acf959f4-6b65-410d-b924-8dc447223ce2",
    title: "Uma Grande Aventura",
    date: "2026-08-26T18:00:00.000Z",
    venue: "Cine Arena",
  },
  // O que a API devolve de verdade: o host dela, que responde JSON.
  shareUrl: "https://verzel-api.paulorb.dev/tickets/TKT-FAGN-VA5K-HUD5",
};

/**
 * Compartilhar tem que levar a pessoa à página pública deste app, não ao
 * endpoint da API. O `shareUrl` da resposta aponta para o host da API — foi
 * o que se compartilhou em produção, entregando um objeto JSON a quem
 * recebeu o link. O teste fixa a origem do link porque o defeito é invisível
 * em revisão: os dois valores são strings plausíveis.
 */
describe("TicketCard — compartilhar", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("compartilha a página pública do app, nunca a URL da API", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { share });

    render(<TicketCard ticket={ticket} />);
    fireEvent.click(screen.getByRole("button", { name: /Compartilhar/ }));

    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    expect(share.mock.calls[0][0].url).toBe(`http://localhost:3000/ticket/${CODE}`);
    expect(share.mock.calls[0][0].url).not.toContain(ticket.shareUrl);
  });

  it("sem navigator.share, copia o mesmo link para a área de transferência", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { clipboard: { writeText } });

    render(<TicketCard ticket={ticket} />);
    fireEvent.click(screen.getByRole("button", { name: /Compartilhar/ }));

    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith(`http://localhost:3000/ticket/${CODE}`),
    );
    expect(await screen.findByRole("button", { name: /Link copiado/ })).toBeInTheDocument();
  });

  /** Fechar a folha nativa rejeita com AbortError: desistir não é erro. */
  it("desistir do compartilhamento não vira rejeição não tratada", async () => {
    const share = vi.fn().mockRejectedValue(new DOMException("cancelado", "AbortError"));
    vi.stubGlobal("navigator", { share });

    render(<TicketCard ticket={ticket} />);
    const button = screen.getByRole("button", { name: /Compartilhar/ });

    expect(() => fireEvent.click(button)).not.toThrow();
    await waitFor(() => expect(share).toHaveBeenCalledTimes(1));
    // Não anuncia "copiado": nada foi copiado nem compartilhado.
    expect(screen.queryByRole("button", { name: /Link copiado/ })).not.toBeInTheDocument();
  });
});
