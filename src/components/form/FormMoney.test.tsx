import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { Form } from "./Form";
import { FormMoney } from "./FormMoney";

const schema = z.object({ price: z.number() });

describe("FormMoney", () => {
  it("envia um número, não uma string, no submit", async () => {
    const onSubmit = vi.fn();
    render(
      <Form schema={schema} onSubmit={onSubmit}>
        <FormMoney name="price" label="Preço" />
        <button type="submit">Salvar</button>
      </Form>,
    );

    const input = screen.getByLabelText("Preço");
    fireEvent.change(input, { target: { value: "45,50" } });
    fireEvent.click(screen.getByText("Salvar"));

    await vi.waitFor(() => expect(onSubmit).toHaveBeenCalled());

    const [values] = onSubmit.mock.calls[0] as [{ price: number }];
    expect(values.price).toBe(45.5);
    expect(typeof values.price).toBe("number");
  });

  it("formata com separador de milhar ao perder o foco", () => {
    render(
      <Form schema={schema} onSubmit={vi.fn()}>
        <FormMoney name="price" label="Preço" />
      </Form>,
    );

    const input = screen.getByLabelText("Preço") as HTMLInputElement;
    fireEvent.change(input, { target: { value: "1234,5" } });
    fireEvent.blur(input);

    expect(input.value).toContain("1.234,50");
  });
});
