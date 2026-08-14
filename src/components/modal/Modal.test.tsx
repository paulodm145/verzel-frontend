import { fireEvent } from "@testing-library/dom";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Modal } from "./Modal";

describe("Modal", () => {
  it("staticBackdrop: clique fora não fecha", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange} staticBackdrop>
        <Modal.Header>Cancelar evento</Modal.Header>
        <Modal.Body>Tem certeza?</Modal.Body>
      </Modal>,
    );

    // O backdrop cobre o resto da tela — clicar nele é "clicar fora".
    const backdrop = document.querySelector('[data-slot="dialog-overlay"]');
    expect(backdrop).not.toBeNull();
    fireEvent.pointerDown(backdrop as Element);
    fireEvent.pointerUp(backdrop as Element);
    fireEvent.click(backdrop as Element);

    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByText("Cancelar evento")).toBeInTheDocument();
  });

  it("modal normal: clique fora fecha", () => {
    const onOpenChange = vi.fn();
    render(
      <Modal open onOpenChange={onOpenChange}>
        <Modal.Header>Editar evento</Modal.Header>
        <Modal.Body>Conteúdo</Modal.Body>
      </Modal>,
    );

    const backdrop = document.querySelector('[data-slot="dialog-overlay"]');
    fireEvent.pointerDown(backdrop as Element);
    fireEvent.pointerUp(backdrop as Element);
    fireEvent.click(backdrop as Element);

    expect(onOpenChange).toHaveBeenCalledWith(false, expect.anything());
  });
});
