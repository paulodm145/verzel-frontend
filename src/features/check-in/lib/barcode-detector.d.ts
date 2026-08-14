/**
 * Tipos mínimos do `BarcodeDetector` nativo (Chrome, Edge, Android). A
 * declaração ainda não está no `lib.dom.d.ts` da versão do TypeScript deste
 * projeto — só o necessário para o `QRScanner` (spec 000, seção 4.4).
 */
export {};

declare global {
  interface BarcodeDetectorOptions {
    formats?: string[];
  }

  interface DetectedBarcode {
    readonly boundingBox: DOMRectReadOnly;
    readonly rawValue: string;
    readonly format: string;
    readonly cornerPoints: ReadonlyArray<{ x: number; y: number }>;
  }

  class BarcodeDetector {
    constructor(options?: BarcodeDetectorOptions);
    static getSupportedFormats(): Promise<string[]>;
    detect(image: ImageBitmapSource): Promise<DetectedBarcode[]>;
  }

  interface Window {
    BarcodeDetector?: typeof BarcodeDetector;
  }
}
