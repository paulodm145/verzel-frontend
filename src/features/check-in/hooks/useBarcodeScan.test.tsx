import { useRef } from "react";

import { render, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useBarcodeScan } from "./useBarcodeScan";

// `vi.hoisted` porque `vi.mock` sobe acima das declarações: o mock é
// avaliado na importação do hook, antes de um `const` comum existir.
const { createBarcodeDecoder } = vi.hoisted(() => ({ createBarcodeDecoder: vi.fn() }));
vi.mock("../lib/barcode-decoder", () => ({ createBarcodeDecoder }));

/**
 * jsdom não decodifica nada: o que se testa aqui é o contrato do loop com
 * quem o usa. Um `<video>` com dimensões fingidas basta para o tick rodar.
 */
function Harness({
  onDetect,
  onError,
}: {
  onDetect: (value: string) => void;
  onError?: (error: unknown) => void;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  useBarcodeScan({ videoRef, active: true, onDetect, onError });
  return <video ref={videoRef} />;
}

beforeEach(() => {
  // O loop se reagenda por requestAnimationFrame quando rVFC não existe.
  vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
    setTimeout(() => cb(0), 0);
    return 1;
  });
  Object.defineProperty(HTMLVideoElement.prototype, "videoWidth", {
    configurable: true,
    get: () => 640,
  });
  Object.defineProperty(HTMLVideoElement.prototype, "videoHeight", {
    configurable: true,
    get: () => 480,
  });
  // getImageData exige um contexto 2d, que o jsdom não implementa.
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    drawImage: vi.fn(),
    getImageData: () => ({ width: 640, height: 480, data: new Uint8ClampedArray(4) }),
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("useBarcodeScan", () => {
  it("entrega ao chamador o valor lido do frame", async () => {
    createBarcodeDecoder.mockResolvedValue({ detect: vi.fn().mockResolvedValue("TOKEN-QR") });
    const onDetect = vi.fn();

    render(<Harness onDetect={onDetect} />);

    await waitFor(() => expect(onDetect).toHaveBeenCalledWith("TOKEN-QR"));
  });

  /**
   * Antes, uma falha ao carregar o decodificador rejeitava a promessa e o
   * loop parava de se reagendar: a câmera seguia mostrando imagem e nunca
   * mais lia nada, sem uma palavra ao operador. Falhar calado na porta é o
   * pior desfecho — ele precisa saber que tem de digitar o código.
   */
  it("avisa quando o decodificador falha, em vez de morrer calado", async () => {
    createBarcodeDecoder.mockRejectedValue(new Error("wasm indisponível"));
    const onError = vi.fn();

    render(<Harness onDetect={vi.fn()} onError={onError} />);

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
  });

  it("uma falha de leitura não vira laço infinito de erro", async () => {
    createBarcodeDecoder.mockRejectedValue(new Error("wasm indisponível"));
    const onError = vi.fn();

    render(<Harness onDetect={vi.fn()} onError={onError} />);

    await waitFor(() => expect(onError).toHaveBeenCalled());
    // O loop encerra na primeira falha: avisar uma vez, não a cada frame.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(onError).toHaveBeenCalledTimes(1);
  });
});
