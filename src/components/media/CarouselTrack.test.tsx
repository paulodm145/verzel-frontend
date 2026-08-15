import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { CarouselTrack } from "./CarouselTrack";

/**
 * jsdom não faz layout: `scrollWidth` e `clientWidth` são sempre 0, e nenhum
 * `scrollBy` de verdade acontece. Simular as duas medidas é o que permite
 * testar a única regra que é de fato lógica aqui — quando cada seta pode ser
 * usada. O resto (snap, arrasto, rolagem suave) é do navegador e não se
 * finge cobrir.
 */
function mockTrackMetrics(scrollWidth: number, clientWidth: number, scrollLeft = 0) {
  const track = screen.getByRole("group", { name: "Em cartaz" });
  Object.defineProperty(track, "scrollWidth", { value: scrollWidth, configurable: true });
  Object.defineProperty(track, "clientWidth", { value: clientWidth, configurable: true });
  Object.defineProperty(track, "scrollLeft", { value: scrollLeft, writable: true });
  track.scrollBy = vi.fn();
  // O componente recalcula no scroll; disparar um força a releitura das
  // medidas recém-injetadas sem depender do ResizeObserver do ambiente.
  fireEvent.scroll(track);
  return track;
}

function renderTrack() {
  render(
    <CarouselTrack label="Em cartaz">
      <div>Primeiro</div>
      <div>Segundo</div>
    </CarouselTrack>,
  );
}

describe("CarouselTrack", () => {
  it("expõe a trilha como grupo nomeado e mantém os filhos no fluxo", () => {
    renderTrack();

    const track = screen.getByRole("group", { name: "Em cartaz" });
    expect(track).toContainElement(screen.getByText("Primeiro"));
    expect(track).toContainElement(screen.getByText("Segundo"));
  });

  it("não renderiza seta alguma quando a trilha cabe inteira", () => {
    renderTrack();
    mockTrackMetrics(300, 300);

    expect(screen.queryByRole("button", { name: /Em cartaz/ })).not.toBeInTheDocument();
  });

  it("no início, só a seta de avançar funciona", () => {
    renderTrack();
    const track = mockTrackMetrics(1000, 300, 0);

    expect(screen.getByRole("button", { name: "Voltar em Em cartaz" })).toBeDisabled();

    const next = screen.getByRole("button", { name: "Avançar em Em cartaz" });
    expect(next).toBeEnabled();

    fireEvent.click(next);
    expect(track.scrollBy).toHaveBeenCalledWith({
      left: 300 * 0.9,
      behavior: "smooth",
    });
  });

  it("no fim da trilha, só a seta de voltar funciona", () => {
    renderTrack();
    // scrollLeft no máximo (scrollWidth - clientWidth) = fim da trilha.
    const track = mockTrackMetrics(1000, 300, 700);

    expect(screen.getByRole("button", { name: "Avançar em Em cartaz" })).toBeDisabled();

    const previous = screen.getByRole("button", { name: "Voltar em Em cartaz" });
    expect(previous).toBeEnabled();

    fireEvent.click(previous);
    expect(track.scrollBy).toHaveBeenCalledWith({
      left: -(300 * 0.9),
      behavior: "smooth",
    });
  });

  it("no meio da trilha, as duas setas funcionam", () => {
    renderTrack();
    mockTrackMetrics(1000, 300, 350);

    expect(screen.getByRole("button", { name: "Voltar em Em cartaz" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Avançar em Em cartaz" })).toBeEnabled();
  });
});
