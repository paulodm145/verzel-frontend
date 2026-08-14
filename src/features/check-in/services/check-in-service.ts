/**
 * Serviço da portaria. Fala com `/api/v/*` via `httpClient`, igual a
 * qualquer outra feature autenticada — o papel `GATE` já está garantido
 * pelo cookie de sessão que o BFF injeta como Bearer no proxy.
 */
import { httpClient } from "@/lib/http-client";

import type { GateEventOption, GateValidateInput, GateValidateResponse } from "../types";

export const checkInService = {
  /**
   * `POST /gate/validate` sempre responde 200 (05-ingressos-e-portaria.md) —
   * o resultado mora em `result`, não no status HTTP. O `httpClient` só
   * rejeita a promise em falha real (rede, 4xx/5xx de uso indevido da API);
   * um ingresso `INVALID`/`ALREADY_USED`/`WRONG_EVENT` é uma resposta 200
   * normal, como qualquer outra.
   */
  async validate(input: GateValidateInput): Promise<GateValidateResponse> {
    const { data } = await httpClient.post<GateValidateResponse>("/gate/validate", input);
    return data;
  },

  /**
   * Lista simplificada para o seletor "evento desta porta" nesta tela.
   * `GET /events` é público — usar direto aqui evita depender da feature de
   * eventos (epic 03), que está em desenvolvimento em paralelo e fora do
   * escopo deste agente. Só os 50 primeiros eventos publicados; sem busca
   * nem paginação — suficiente para escolher a porta, não é a listagem de
   * catálogo.
   */
  async listPublishedEvents(): Promise<GateEventOption[]> {
    const { data } = await httpClient.get<{ items: GateEventOption[] }>("/events", {
      params: { take: 50 },
    });
    return data.items.filter((event) => event.status === "PUBLISHED");
  },
};
