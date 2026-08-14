"use client";

import { useQuery } from "@tanstack/react-query";

import { authService } from "../services/auth-service";

/** Chave compartilhada com useLogin/useRegister/useLogout, que atualizam o
 * cache diretamente em vez de invalidar — a resposta de login já traz o
 * usuário completo, refazer a chamada seria desperdício (07-performance.md). */
export const SESSION_QUERY_KEY = ["auth", "session"] as const;

export function useSession() {
  return useQuery({
    queryKey: SESSION_QUERY_KEY,
    queryFn: () => authService.session(),
    // A sessão só muda por ação explícita (login/logout) — nunca fica velha
    // sozinha, então não há por que revalidar em background.
    staleTime: Infinity,
    retry: false,
  });
}
