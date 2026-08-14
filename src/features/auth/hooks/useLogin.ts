"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { authService } from "../services/auth-service";
import type { LoginInput } from "../types";
import { SESSION_QUERY_KEY } from "./useSession";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: LoginInput) => authService.login(input),
    onSuccess: ({ user }) => {
      queryClient.setQueryData(SESSION_QUERY_KEY, user);
    },
  });
}
