"use client";

import { useCallback } from "react";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

import { isApiError } from "@/lib/api-errors";
import { translateValidationDetail } from "@/lib/field-labels";

const BODY_PATH = "(corpo)";

/**
 * Aplica um ApiError de VALIDATION_ERROR ao formulário: cada `details[].path`
 * conhecido pelo formulário vira erro de campo (traduzido, nunca a frase do
 * Zod); "(corpo)" e paths sem campo correspondente caem no erro geral
 * (`errors.root`, exibido via <FormRootError />) — nunca somem em silêncio.
 *
 * Devolve `true` quando tratou o erro (o chamador não precisa de fallback
 * genérico); `false` quando o erro não é de validação e deve seguir para o
 * tratamento padrão (toast com `messages.ts`, tela de erro genérica etc).
 */
export function useApiFormErrors<TFieldValues extends FieldValues>(
  form: UseFormReturn<TFieldValues>,
) {
  const { setError, getValues } = form;

  return useCallback(
    (error: unknown): boolean => {
      if (!isApiError(error) || error.code !== "VALIDATION_ERROR") return false;

      const details = error.details ?? [];
      const knownTopLevelFields = new Set(Object.keys(getValues() ?? {}));
      const rootMessages: string[] = [];

      if (details.length === 0) {
        rootMessages.push(error.message);
      }

      for (const detail of details) {
        const isBody = detail.path === BODY_PATH;
        const topLevel = detail.path.split(".")[0];
        const message = translateValidationDetail(detail.path, detail.message);

        if (!isBody && knownTopLevelFields.has(topLevel)) {
          setError(detail.path as Path<TFieldValues>, { type: "server", message });
        } else {
          rootMessages.push(message);
        }
      }

      if (rootMessages.length > 0) {
        setError("root" as Path<TFieldValues>, { type: "server", message: rootMessages.join(" ") });
      }

      return true;
    },
    [setError, getValues],
  );
}
