"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { isApiError } from "@/lib/api-errors";
import { messages } from "@/lib/messages";

import { useApiFormErrors } from "@/components/form/useApiFormErrors";

/**
 * Mesmo padrão de `features/auth/components/ApplyMutationFormError.tsx`,
 * duplicado aqui de propósito: a feature de eventos não depende da de auth
 * só para reaproveitar ~15 linhas — cada feature fica dona do seu próprio
 * tratamento de erro de formulário.
 */
export function ApplyEventFormError({ error }: { error: unknown }) {
  const form = useFormContext();
  const applyApiErrors = useApiFormErrors(form);

  useEffect(() => {
    if (!error) return;
    if (applyApiErrors(error)) return;
    form.setError("root", {
      type: "server",
      message: isApiError(error) ? error.message : messages.network.unexpected,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  return null;
}
