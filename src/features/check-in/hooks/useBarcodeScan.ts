"use client";

import { useEffect, useRef, type RefObject } from "react";

import { createBarcodeDecoder } from "../lib/barcode-decoder";

interface UseBarcodeScanOptions {
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Câmera pronta e não travada — controla se o loop de decodificação roda. */
  active: boolean;
  onDetect: (value: string) => void;
  /** Chamado quando a decodificação para de funcionar de vez. */
  onError?: (error: unknown) => void;
}

/**
 * Loop de decodificação: um frame do `<video>` por vez, via
 * `requestVideoFrameCallback` (cai para `requestAnimationFrame` onde não
 * existe). Desenha o frame num canvas fora de tela para obter `ImageData` —
 * formato aceito tanto pelo `BarcodeDetector` nativo quanto pelo
 * `zxing-wasm`, o que mantém as duas estratégias atrás da mesma interface.
 */
export function useBarcodeScan({
  videoRef,
  active,
  onDetect,
  onError,
}: UseBarcodeScanOptions): void {
  const onDetectRef = useRef(onDetect);
  const onErrorRef = useRef(onError);
  // Atualiza a ref dentro de um efeito, não durante o render: mutar
  // `.current` no corpo do componente é o que a regra `react-hooks/refs`
  // proíbe, ainda que o valor não afete o que é renderizado.
  useEffect(() => {
    onDetectRef.current = onDetect;
    onErrorRef.current = onError;
  }, [onDetect, onError]);

  useEffect(() => {
    if (!active) return;
    const video = videoRef.current;
    if (!video) return;

    let cancelled = false;
    const decoderPromise = createBarcodeDecoder();
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d", { willReadFrequently: true });

    async function tick() {
      try {
        if (!cancelled && video && context && video.videoWidth && video.videoHeight) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          context.drawImage(video, 0, 0, canvas.width, canvas.height);
          const frame = context.getImageData(0, 0, canvas.width, canvas.height);
          const decoder = await decoderPromise;
          const value = await decoder.detect(frame);
          if (value && !cancelled) onDetectRef.current(value);
        }
      } catch (error) {
        // Sem este catch, uma falha ao carregar o decodificador rejeitava a
        // promessa e o loop simplesmente parava de se reagendar: a câmera
        // seguia mostrando imagem e não lia mais nada, sem uma palavra ao
        // operador. Falhar em silêncio na porta é o pior desfecho possível —
        // ele precisa saber que tem de digitar o código.
        if (!cancelled) onErrorRef.current?.(error);
        return;
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
