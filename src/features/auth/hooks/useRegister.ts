"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "../services/auth-service";
import type { RegisterInput } from "../types";
import { SESSION_QUERY_KEY } from "./useSession";

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: RegisterInput) => authService.register(input),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
    },
  });
}
