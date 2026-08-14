import { beforeEach, describe, expect, it } from "vitest";

import { useReservationIntentStore } from "./store";

describe("useReservationIntentStore", () => {
  beforeEach(() => {
    useReservationIntentStore.getState().clear();
  });

  it("reutiliza a mesma chave para o mesmo assento (mesma intenção)", () => {
    const { getOrCreateKey } = useReservationIntentStore.getState();

    const first = getOrCreateKey("assento-a1");
    const second = getOrCreateKey("assento-a1");

    expect(second).toBe(first);
  });

  it("gera uma chave diferente ao trocar de assento", () => {
    const { getOrCreateKey } = useReservationIntentStore.getState();

    const forA1 = getOrCreateKey("assento-a1");
    const forA2 = getOrCreateKey("assento-a2");

    expect(forA2).not.toBe(forA1);
  });

  it("volta a gerar chave nova para o assento anterior depois de trocar e voltar", () => {
    // Trocar de assento descarta a intenção antiga por completo — escolher
    // A1 de novo depois de A2 não deveria "lembrar" da primeira chave.
    const { getOrCreateKey } = useReservationIntentStore.getState();

    const firstForA1 = getOrCreateKey("assento-a1");
    getOrCreateKey("assento-a2");
    const secondForA1 = getOrCreateKey("assento-a1");

    expect(secondForA1).not.toBe(firstForA1);
  });

  it("clear() apaga a intenção em curso", () => {
    const { getOrCreateKey, clear } = useReservationIntentStore.getState();

    const before = getOrCreateKey("assento-a1");
    clear();
    const after = getOrCreateKey("assento-a1");

    expect(after).not.toBe(before);
  });
});
