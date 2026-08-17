/** Espelha o contrato de `05-ingressos-e-portaria.md`. */
export type TicketStatus = "VALID" | "USED";

export interface TicketEventSummary {
  id: string;
  title: string;
  /** ISO UTC — renderizar com `Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo" })`. */
  date: string;
  venue: string;
}

/** `GET /tickets/mine` — o evento já vem embutido, nunca refazer `/events/:id`. */
export interface Ticket {
  id: string;
  code: string;
  status: TicketStatus;
  /** String assinada para o QR — não é uma URL nem um valor a recompor no cliente. */
  qrContent: string;
  seatLabel: string;
  usedAt: string | null;
  event: TicketEventSummary;
  /**
   * Vem na resposta, mas **não é usado**: aponta para o host da API, que
   * responde JSON. O link de compartilhamento é montado por
   * `lib/share-url.ts` sobre a página pública deste app.
   */
  shareUrl: string;
}

/**
 * `GET /tickets/:code` — link de compartilhamento público. Mesmo objeto,
 * sem `shareUrl` (não faz sentido compartilhar o link de dentro do link) e
 * sem dado de comprador.
 */
export type PublicTicket = Omit<Ticket, "shareUrl">;

export interface TicketsPage {
  items: Ticket[];
  total: number;
  skip: number;
  take: number;
}

export interface MyTicketsParams {
  skip?: number;
  take?: number;
}
