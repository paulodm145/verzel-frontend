"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

export type CameraStatus = "requesting" | "ready" | "denied" | "unsupported";

export interface UseCameraStreamResult {
  videoRef: RefObject<HTMLVideoElement | null>;
  status: CameraStatus;
}

/**
 * Ciclo de vida da câmera, isolado do resto do `QRScanner`: abre com
 * `getUserMedia({ video: { facingMode: "environment" } })` e — o ponto que
 * mais importa aqui — encerra as tracks ao desmontar. Câmera presa ligada
 * depois que o operador sai da tela é bug real em celular (bateria, e o LED
 * de câmera ativa assustando quem está por perto).
 */
function isGetUserMediaSupported(): boolean {
  return typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia);
}

export function useCameraStream(): UseCameraStreamResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // Inicializador preguiçoso, não `setState` dentro do efeito: o suporte do
  // navegador não muda entre renders, então não há razão para sincronizar
  // isso via efeito — só o pedido assíncrono de câmera precisa de um.
  const [status, setStatus] = useState<CameraStatus>(() =>
    isGetUserMediaSupported() ? "requesting" : "unsupported",
  );

  useEffect(() => {
    if (!isGetUserMediaSupported()) return;

    let stream: MediaStream | null = null;
    let cancelled = false;

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then((mediaStream) => {
        if (cancelled) {
          mediaStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = mediaStream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = mediaStream;
          void video.play().catch(() => {
            // autoplay pode ser recusado por política do navegador; o
            // operador ainda vê o botão/entrada manual, não é fatal.
          });
        }
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("denied");
      });

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return { videoRef, status };
}
