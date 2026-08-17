import { afterEach, describe, expect, it, vi } from "vitest";

import { createBarcodeDecoder } from "./barcode-decoder";

const readBarcodes = vi.fn().mockResolvedValue([]);
const prepareZXingModule = vi.fn();

vi.mock("zxing-wasm/reader", () => ({ readBarcodes, prepareZXingModule }));

/**
 * O `zxing-wasm` busca o `.wasm` em runtime e, por padrão, na CDN da
 * jsDelivr. Na portaria isso é o pior lugar possível para uma dependência
 * externa: quem precisa do fallback (Safari no iPhone, Firefox) descobriria
 * que não tem internet pública com a fila esperando.
 *
 * Este teste existe porque a regressão é silenciosa — remover a chamada de
 * `prepareZXingModule` não quebra nada em desenvolvimento, onde a CDN
 * responde. Só quebra na porta.
 */
describe("createBarcodeDecoder — fallback wasm", () => {
  afterEach(() => {
    vi.clearAllMocks();
    delete (window as unknown as { BarcodeDetector?: unknown }).BarcodeDetector;
  });

  it("carrega o wasm do próprio domínio, nunca de CDN", async () => {
    await createBarcodeDecoder();

    expect(prepareZXingModule).toHaveBeenCalledTimes(1);
    const { overrides } = prepareZXingModule.mock.calls[0][0];
    const path = overrides.locateFile("zxing_reader.wasm", "/qualquer/prefixo/");

    expect(path).toBe("/zxing_reader.wasm");
    expect(path).not.toMatch(/^https?:/);
  });

  it("com detector nativo, não toca no wasm", async () => {
    class FakeDetector {
      detect = vi.fn().mockResolvedValue([]);
    }
    (window as unknown as { BarcodeDetector: unknown }).BarcodeDetector = FakeDetector;

    await createBarcodeDecoder();

    expect(prepareZXingModule).not.toHaveBeenCalled();
    expect(readBarcodes).not.toHaveBeenCalled();
  });
});
