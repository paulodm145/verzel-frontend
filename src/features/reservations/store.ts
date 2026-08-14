import { create } from "zustand";

interface ReservationIntent {
  seatId: string;
  idempotencyKey: string;
}

interface ReservationIntentState {
  intent: ReservationIntent | null;
  /**
   * Uma `Idempotency-Key` por intenção do usuário (04-reserva-e-pagamento.md,
   * "a regra que confunde"). Chamado no clique de "reservar este assento":
   * se o assento pedido é o mesmo da tentativa em curso, devolve a MESMA
   * chave — é isso que torna um duplo clique ou um retry de rede inofensivo.
   * Assento diferente é uma intenção nova: descarta a chave anterior e gera
   * outra, porque reaproveitar a chave de A1 num pedido de A2 faria a API
   * responder 409 (chave usada com corpo diferente) de propósito.
   */
  getOrCreateKey: (seatId: string) => string;
  /** Limpa a intenção — chamado após reserva criada com sucesso, cancelada,
   * ou quando a reserva expira e o usuário volta a escolher um assento. */
  clear: () => void;
}

export const useReservationIntentStore = create<ReservationIntentState>((set, get) => ({
  intent: null,

  getOrCreateKey: (seatId) => {
    const current = get().intent;
    if (current && current.seatId === seatId) return current.idempotencyKey;

    const idempotencyKey = crypto.randomUUID();
    set({ intent: { seatId, idempotencyKey } });
    return idempotencyKey;
  },

  clear: () => set({ intent: null }),
}));
