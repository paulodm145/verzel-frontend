import { act, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { QRScanner } from "./QRScanner";

/**
 * jsdom não implementa `getUserMedia`, `BarcodeDetector` nem
 * `HTMLVideoElement.play()` — os três precisam de dublê para o componente
 * nem tentar a estratégia real de câmera/decodificação durante o teste.
 */
function mockGetUserMedia(stream: MediaStream) {
  Object.defineProperty(navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: vi.fn().mockResolvedValue(stream) },
  });
}

function fakeStream(): { stream: MediaStream; stop: ReturnType<typeof vi.fn> } {
  const stop = vi.fn();
  const track = { stop } as unknown as MediaStreamTrack;
  const stream = { getTracks: () => [track] } as unknown as MediaStream;
  return { stream, stop };
}

describe("QRScanner", () => {
  beforeEach(() => {
    // BarcodeDetector nativo "existe" no ambiente de teste — evita que o
    // componente tente o import dinâmico do fallback zxing-wasm.
    (window as unknown as { BarcodeDetector: unknown }).BarcodeDetector = class {
      detect() {
        return Promise.resolve([]);
      }
    };
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue(undefined);
    // jsdom não implementa canvas 2D; sem o dublê, cada frame do loop de
    // decodificação imprime "Not implemented" no console do teste.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector;
    // @ts-expect-error -- só existe porque o teste anterior definiu.
    delete navigator.mediaDevices;
  });

  it("encerra as tracks da câmera ao desmontar — câmera presa ligada é bug real em celular", async () => {
    const { stream, stop } = fakeStream();
    mockGetUserMedia(stream);

    const { unmount } = render(<QRScanner active onDetect={vi.fn()} />);

    await waitFor(() => expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled());

    unmount();

    expect(stop).toHaveBeenCalledTimes(1);
  });

  it("mostra o aviso de câmera indisponível, com o input manual como saída, quando a permissão é negada", async () => {
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(new DOMException("Permission denied")) },
    });

    render(<QRScanner active onDetect={vi.fn()} />);

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Não foi possível acessar a câmera. Use o código manual abaixo.",
    );
  });

  it("pede a câmera traseira via facingMode: environment", async () => {
    const { stream } = fakeStream();
    mockGetUserMedia(stream);

    render(<QRScanner active onDetect={vi.fn()} />);

    await waitFor(() =>
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: { facingMode: "environment" },
      }),
    );
  });

  it("não chama getUserMedia de novo só porque a leitura foi travada (active: false)", async () => {
    const { stream } = fakeStream();
    mockGetUserMedia(stream);

    const { rerender } = render(<QRScanner active onDetect={vi.fn()} />);
    await waitFor(() => expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1));

    act(() => {
      rerender(<QRScanner active={false} onDetect={vi.fn()} />);
    });

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledTimes(1);
  });
});
