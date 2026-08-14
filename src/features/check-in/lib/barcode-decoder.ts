/**
 * Estratégia de leitura de QR atrás de uma interface única (spec 000, seção
 * 4.4): `BarcodeDetector` nativo quando o navegador oferece (Chrome, Edge,
 * Android — decodificação no sistema, zero byte de bundle) e `zxing-wasm`
 * carregado **sob demanda** só quando não há suporte nativo (Safari,
 * Firefox). O `QRScanner` não sabe qual dos dois está em uso.
 */
export interface BarcodeDecoder {
  /** Devolve o texto do primeiro QR encontrado no frame, ou `null`. */
  detect(imageData: ImageData): Promise<string | null>;
}

export function supportsNativeBarcodeDetector(): boolean {
  return typeof window !== "undefined" && "BarcodeDetector" in window;
}

function createNativeDecoder(): BarcodeDecoder {
  const detector = new window.BarcodeDetector!({ formats: ["qr_code"] });
  return {
    async detect(imageData) {
      const codes = await detector.detect(imageData);
      return codes[0]?.rawValue ?? null;
    },
  };
}

async function createWasmDecoder(): Promise<BarcodeDecoder> {
  // Import dinâmico: o pacote (e o `.wasm` que ele busca em runtime) só
  // baixa para quem realmente precisa do fallback — a maioria dos leitores
  // de portaria em Chrome/Edge/Android nunca paga esse custo.
  const { readBarcodes } = await import("zxing-wasm/reader");
  return {
    async detect(imageData) {
      const results = await readBarcodes(imageData, {
        formats: ["QRCode"],
        maxNumberOfSymbols: 1,
        tryHarder: true,
      });
      return results.find((result) => result.isValid)?.text ?? null;
    },
  };
}

/** Escolhida uma vez por sessão de câmera — nativo ou wasm não muda em
 * seguida. */
export function createBarcodeDecoder(): Promise<BarcodeDecoder> {
  if (supportsNativeBarcodeDetector()) return Promise.resolve(createNativeDecoder());
  return createWasmDecoder();
}
