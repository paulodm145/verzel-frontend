import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { Form } from "./Form";
import { FormPassword } from "./FormPassword";

/**
 * O defeito que motivou estes testes era de CSS — `-translate-y-1/2` colidindo
 * com o `active:translate-y-px` do buttonVariants — e jsdom não calcula
 * layout, então ele NÃO é observável aqui. O que estes testes protegem é o
 * contrato de comportamento do campo, que a correção não podia quebrar.
 */

const schema = z.object({ password: z.string().min(1) });

function renderField() {
  render(
    <Form schema={schema} onSubmit={vi.fn()} defaultValues={{ password: "" }}>
      <FormPassword name="password" label="Senha" autoComplete="current-password" />
    </Form>,
  );
  // <input type="password"> não expõe role, então o vínculo label/id gerado
  // pelo useId é o único seletor estável — e exercitá-lo também garante que a
  // label continua clicável para o campo.
  return screen.getByLabelText("Senha");
}

describe("FormPassword", () => {
  it("nasce oculto e alterna para texto ao acionar o botão", () => {
    const input = renderField();

    expect(input).toHaveAttribute("type", "password");

    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));
    expect(input).toHaveAttribute("type", "text");

    fireEvent.click(screen.getByRole("button", { name: "Ocultar senha" }));
    expect(input).toHaveAttribute("type", "password");
  });

  it("preserva o valor digitado ao alternar a visibilidade", () => {
    const input = renderField();

    fireEvent.change(input, { target: { value: "portaria123" } });
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(input).toHaveValue("portaria123");
  });

  it("expõe o estado do botão para leitor de tela", () => {
    renderField();

    const toggle = screen.getByRole("button", { name: "Mostrar senha" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(toggle);
    expect(screen.getByRole("button", { name: "Ocultar senha" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("não submete o formulário ao alternar a visibilidade", () => {
    const onSubmit = vi.fn();
    render(
      <Form schema={schema} onSubmit={onSubmit} defaultValues={{ password: "" }}>
        <FormPassword name="password" label="Senha" />
        <button type="submit">Entrar</button>
      </Form>,
    );

    fireEvent.change(screen.getByLabelText("Senha"), { target: { value: "portaria123" } });
    fireEvent.click(screen.getByRole("button", { name: "Mostrar senha" }));

    expect(onSubmit).not.toHaveBeenCalled();
  });
});
