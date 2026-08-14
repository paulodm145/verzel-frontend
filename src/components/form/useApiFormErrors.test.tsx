import { useForm } from "react-hook-form";

import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api-errors";

import { useApiFormErrors } from "./useApiFormErrors";

/**
 * Um único renderHook, lendo `formState.errors` no corpo — react-hook-form só
 * dispara re-render em quem efetivamente "toca" o proxy de formState. Duas
 * chamadas de renderHook separadas (uma para o form, outra para o apply)
 * deixavam o teste sempre vendo o snapshot inicial.
 */
function setup() {
  const { result } = renderHook(() => {
    const form = useForm<{ email: string; password: string }>({
      defaultValues: { email: "", password: "" },
    });
    const apply = useApiFormErrors(form);
    return { form, apply, errors: form.formState.errors };
  });

  return result;
}

describe("useApiFormErrors", () => {
  it("mapeia um details[].path conhecido para o erro do campo certo, traduzido", () => {
    const result = setup();
    const error = new ApiError(400, "VALIDATION_ERROR", "Dados de entrada inválidos", [
      { path: "email", message: "Invalid email address" },
    ]);

    act(() => {
      result.current.apply(error);
    });

    expect(result.current.errors.email?.message).toBeTruthy();
    expect(result.current.errors.email?.message).not.toMatch(/Invalid email/);
    expect(result.current.errors.root).toBeUndefined();
  });

  it('roteia "(corpo)" para o erro geral do formulário, não some em silêncio', () => {
    const result = setup();
    const error = new ApiError(400, "VALIDATION_ERROR", "Dados de entrada inválidos", [
      { path: "(corpo)", message: "Required" },
    ]);

    act(() => {
      result.current.apply(error);
    });

    expect(result.current.errors.root?.message).toBeTruthy();
    expect(result.current.errors.email).toBeUndefined();
  });

  it("roteia path sem campo correspondente para o erro geral", () => {
    const result = setup();
    const error = new ApiError(400, "VALIDATION_ERROR", "Dados de entrada inválidos", [
      { path: "campoQueNaoExisteNesteForm", message: "Required" },
    ]);

    act(() => {
      result.current.apply(error);
    });

    expect(result.current.errors.root?.message).toBeTruthy();
  });

  it("ignora erros que não são VALIDATION_ERROR e devolve false", () => {
    const result = setup();
    const error = new ApiError(409, "CONFLICT", "Assento já reservado");

    let handled = true;
    act(() => {
      handled = result.current.apply(error);
    });

    expect(handled).toBe(false);
  });
});
