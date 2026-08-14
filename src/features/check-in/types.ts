/** Espelha `ValidationResult` de `06-erros-e-convencoes.md`. */
export type ValidationResultKind = "VALID" | "ALREADY_USED" | "WRONG_EVENT" | "INVALID";

export interface ValidatedTicketSummary {
  code: string;
  seatLabel?: string | null;
  eventTitle?: string | null;
  /**
   * Não faz parte do contrato documentado em `05-ingressos-e-portaria.md`
   * (que só lista `code`, `seatLabel`, `eventTitle`) — campo defensivo.
   * Exibido quando presente, porque quem está na porta precisa conferir a
   * pessoa na fila, não só a cor da tela.
   */
  holderName?: string | null;
}

/** Corpo de `POST /gate/validate` — sempre 200, o resultado mora aqui dentro. */
export interface GateValidateResponse {
  result: ValidationResultKind;
  message: string;
  ticket?: ValidatedTicketSummary | null;
  usedAt?: string | null;
}

interface GateValidateBase {
  eventId: string;
}

/** Mande `qrContent` OU `code`, nunca os dois. */
export type GateValidateInput =
  | (GateValidateBase & { qrContent: string; code?: never })
  | (GateValidateBase & { code: string; qrContent?: never });

/** Recorte mínimo de `Event` — só o que o seletor "evento desta porta" usa. */
export interface GateEventOption {
  id: string;
  title: string;
  venue: string;
  date: string;
  status: "DRAFT" | "PUBLISHED" | "CANCELED";
}
