import { act, renderHook } from "@testing-library/react";
import { useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { ApiError } from "@/lib/api-errors";

import { useApiFormErrors } from "./useApiFormErrors";

function setup() {
  const { result } = renderHook(() =>
    useForm<{ email: string; password: string }>({
      defaultValues: { email: "", password: "" },
    }),
  );
  const { result: applyResult } = renderHook(() => useApiFormErrors(result.current));

  return { form: result, apply: applyResult };
}

describe("useApiFormErrors", () => {
  it("mapeia um details[].path conhecido para o erro do campo certo, traduzido", () => {
    const { form, apply } = setup();
    const error = new ApiError(400, "VALIDATION_ERROR", "Dados de entrada inválidos", [
      { path: "email", message: "Invalid email address" },
    ]);

    act(() => {
      apply.current(error);
    });

    expect(form.current.formState.errors.email?.message).toBeTruthy();
    expect(form.current.formState.errors.email?.message).not.toMatch(/Invalid email/);
    expect(form.current.formState.errors.root).toBeUndefined();
  });

  it('roteia "(corpo)" para o erro geral do formulário, não some em silêncio', () => {
    const { form, apply } = setup();
    const error = new ApiError(400, "VALIDATION_ERROR", "Dados de entrada inválidos", [
      { path: "(corpo)", message: "Required" },
    ]);

    act(() => {
      apply.current(error);
    });

    expect(form.current.formState.errors.root?.message).toBeTruthy();
    expect(form.current.formState.errors.email).toBeUndefined();
  });

  it("roteia path sem campo correspondente para o erro geral", () => {
    const { form, apply } = setup();
    const error = new ApiError(400, "VALIDATION_ERROR", "Dados de entrada inválidos", [
      { path: "campoQueNaoExisteNesteForm", message: "Required" },
    ]);

    act(() => {
      apply.current(error);
    });

    expect(form.current.formState.errors.root?.message).toBeTruthy();
  });

  it("ignora erros que não são VALIDATION_ERROR e devolve false", () => {
    const { apply } = setup();
    const error = new ApiError(409, "CONFLICT", "Assento já reservado");

    let handled = true;
    act(() => {
      handled = apply.current(error);
    });

    expect(handled).toBe(false);
  });
});
