"use client";

import { useMutation } from "@tanstack/react-query";

import { checkInService } from "../services/check-in-service";
import type { GateValidateInput } from "../types";

/**
 * `POST /gate/validate` sempre devolve 200 — um ingresso `INVALID`,
 * `ALREADY_USED` ou `WRONG_EVENT` é um resultado de negócio, não uma falha
 * de rede ou de uso da API. Esta mutation nunca lança nesses casos: a
 * `mutateAsync` resolve com o corpo inteiro, e é a tela quem decide o que
 * mostrar a partir de `result`. Só rejeita em falha real — sem conexão,
 * timeout, ou um 4xx/5xx de verdade (papel errado, corpo malformado) — que
 * a tela trata de outro jeito (banner de erro, não a tela cheia dos 4
 * estados).
 */
export function useValidateTicket() {
  return useMutation({
    mutationFn: (input: GateValidateInput) => checkInService.validate(input),
  });
}
