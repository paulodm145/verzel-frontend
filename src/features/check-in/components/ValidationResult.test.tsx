import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import type { GateValidateResponse, ValidationResultKind } from "../types";
import { ValidationResult } from "./ValidationResult";

function outcomeFor(result: ValidationResultKind): GateValidateResponse {
  return {
    result,
    message: `mensagem para ${result}`,
    ticket: { code: "TKT-AAAA-BBBB-CCCC", seatLabel: "A1", eventTitle: "Evento Teste" },
    usedAt: result === "ALREADY_USED" ? "2026-08-13T21:00:00.000Z" : null,
  };
}

describe("ValidationResult", () => {
  it.each<ValidationResultKind>(["VALID", "ALREADY_USED", "WRONG_EVENT", "INVALID"])(
    "renderiza um ícone e uma cor de fundo próprios para %s",
    (result) => {
      const { container } = render(
        <ValidationResult outcome={outcomeFor(result)} onDismiss={vi.fn()} />,
      );

      const root = container.querySelector(`[data-result="${result}"]`);
      expect(root).not.toBeNull();
      expect(screen.getByTestId("result-icon")).toBeInTheDocument();
    },
  );

  it("os 4 estados usam ícones (SVGs) diferentes entre si — cor sozinha não basta", () => {
    const paths = (["VALID", "ALREADY_USED", "WRONG_EVENT", "INVALID"] as const).map((result) => {
      const { container, unmount } = render(
        <ValidationResult outcome={outcomeFor(result)} onDismiss={vi.fn()} />,
      );
      const icon = container.querySelector('[data-testid="result-icon"]');
      const markup = icon?.innerHTML ?? "";
      unmount();
      return markup;
    });

    expect(new Set(paths).size).toBe(4);
  });

  it("os 4 estados usam classes de cor de fundo diferentes entre si", () => {
    const classNames = (["VALID", "ALREADY_USED", "WRONG_EVENT", "INVALID"] as const).map(
      (result) => {
        const { container, unmount } = render(
          <ValidationResult outcome={outcomeFor(result)} onDismiss={vi.fn()} />,
        );
        const root = container.querySelector(`[data-result="${result}"]`);
        const className = root?.className ?? "";
        unmount();
        return className;
      },
    );

    expect(new Set(classNames).size).toBe(4);
  });

  it("mostra nome do assento e horário da entrada anterior quando a API os devolve", () => {
    render(<ValidationResult outcome={outcomeFor("ALREADY_USED")} onDismiss={vi.fn()} />);

    expect(screen.getByText(/A1/)).toBeInTheDocument();
    expect(screen.getByText(/Entrada anterior:/)).toBeInTheDocument();
  });

  it("chama onDismiss ao clicar em 'Próxima leitura'", async () => {
    const onDismiss = vi.fn();
    render(<ValidationResult outcome={outcomeFor("VALID")} onDismiss={onDismiss} />);

    screen.getByRole("button", { name: "Próxima leitura" }).click();

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
