"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "../services/auth-service";
import { SESSION_QUERY_KEY } from "./useSession";

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.setQueryData(SESSION_QUERY_KEY, null);
      // Limpa todo o cache de dados do servidor: o próximo usuário no mesmo
      // navegador não pode herdar nada da sessão anterior.
      queryClient.clear();
    },
  });
}
