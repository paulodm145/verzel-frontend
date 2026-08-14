"use client";

import { useEffect, useRef, type RefObject } from "react";

import { createBarcodeDecoder } from "../lib/barcode-decoder";

interface UseBarcodeScanOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Câmera pronta e não travada — controla se o loop de decodificação roda. */
  active: boolean;
  onDetect: (value: string) => void;
}

/**
 * Loop de decodificação: um frame do `<video>` por vez, via
 * `requestVideoFrameCallback` (cai para `requestAnimationFrame` onde não
 * existe). Desenha o frame num canvas fora de tela para obter `ImageData` —
 * formato aceito tanto pelo `BarcodeDetector` nativo quanto pelo
 * `zxing-wasm`, o que mantém as duas estratégias atrás da mesma interface.
 */
export function useBarcodeScan({ videoRef, active, onDetect }: UseBarcodeScanOptions): void {
  const onDetectRef = useRef(onDetect);
  // Atualiza a ref dentro de um efeito, não durante o render: mutar
  // `.current` no corpo do componente é o que a regra `react-hooks/refs`
  // proíbe, ainda que o valor não afete o que é renderizado.
  useEffect(() => {
    onDetectRef.current = onDetect;
  }, [onDetect]);

  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const decoderPromise = createBarcodeDecoder();
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    async function tick() {
      if (!cancelled && video && context && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const frame = context.getImageData(0, 0, canvas.width, canvas.height);
        const decoder = await decoderPromise;
        const value = await decoder.detect(frame);
        if (value && !cancelled) onDetectRef.current(value);
      }
      schedule();
    }

    function schedule() {
      if (cancelled || !video) return;
      if (typeof video.requestVideoFrameCallback === "function") {
        video.requestVideoFrameCallback(() => void tick());
      } else {
        requestAnimationFrame(() => void tick());
      }
    }

    schedule();

    return () => {
      cancelled = true;
    };
  }, [active, videoRef]);
}
