import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { ReservationCountdown } from "./ReservationCountdown";

describe("ReservationCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("conta a partir de expiresAt e atualiza a cada segundo", () => {
    const expiresAt = new Date(Date.now() + 5_000).toISOString();
    render(<ReservationCountdown expiresAt={expiresAt} />);

    expect(screen.getByRole("timer")).toHaveTextContent("0:05");

    act(() => {
      vi.advanceTimersByTime(2_000);
    });

    expect(screen.getByRole("timer")).toHaveTextContent("0:03");
  });

  it("desaparece e chama onExpire uma única vez ao chegar a zero", () => {
    const expiresAt = new Date(Date.now() + 3_000).toISOString();
    const onExpire = vi.fn();
    render(<ReservationCountdown expiresAt={expiresAt} onExpire={onExpire} />);

    expect(screen.queryByRole("timer")).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(3_000);
    });
    expect(screen.queryByRole("timer")).toBeNull();
    expect(onExpire).toHaveBeenCalledTimes(1);

    // Continuar avançando o relógio não deve chamar onExpire de novo.
    act(() => {
      vi.advanceTimersByTime(5_000);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });
});
