import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useScanLock } from "./useScanLock";

describe("useScanLock", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ignora uma segunda leitura dentro da janela de 2s", async () => {
    const { result } = renderHook(() => useScanLock());
    const task = vi.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.guard(task);
    });
    // Segunda leitura chega "instantaneamente" (ex.: a câmera ainda enxerga
    // o mesmo QR em quadro) — exatamente o cenário que a trava existe para
    // evitar (05-ingressos-e-portaria.md).
    await act(async () => {
      await result.current.guard(task);
    });

    expect(task).toHaveBeenCalledTimes(1);
    expect(result.current.locked).toBe(true);
  });

  it("destrava 2s depois da tarefa terminar, liberando a próxima leitura", async () => {
    const { result } = renderHook(() => useScanLock());
    const task = vi.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.guard(task);
    });
    expect(result.current.locked).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(1999);
    });
    expect(result.current.locked).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.locked).toBe(false);

    await act(async () => {
      await result.current.guard(task);
    });
    expect(task).toHaveBeenCalledTimes(2);
  });

  it("destrava mesmo quando a tarefa falha", async () => {
    const { result } = renderHook(() => useScanLock());
    const task = vi.fn().mockRejectedValue(new Error("falha de rede"));

    await act(async () => {
      await expect(result.current.guard(task)).rejects.toThrow("falha de rede");
    });
    expect(result.current.locked).toBe(true);

    await act(async () => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.locked).toBe(false);
  });

  it("unlock() destrava na hora, sem esperar os 2s", async () => {
    const { result } = renderHook(() => useScanLock());
    const task = vi.fn().mockResolvedValue(undefined);

    await act(async () => {
      await result.current.guard(task);
    });
    expect(result.current.locked).toBe(true);

    act(() => {
      result.current.unlock();
    });
    expect(result.current.locked).toBe(false);

    await act(async () => {
      await result.current.guard(task);
    });
    expect(task).toHaveBeenCalledTimes(2);
  });
});
