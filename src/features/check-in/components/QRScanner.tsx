"use client";

import { CameraOff } from "lucide-react";

import { messages } from "@/lib/messages";

import { useBarcodeScan } from "../hooks/useBarcodeScan";
import { useCameraStream } from "../hooks/useCameraStream";

interface QRScannerProps {
  /** `false` enquanto uma validação está em curso — pausa a decodificação
   * sem desligar a câmera (spec 000, 4.4: ciclo de vida e trava de leitura
   * são responsabilidades relacionadas, mas a trava em si mora em
   * `useScanLock`, compartilhada com o `ManualCodeInput`). */
  active: boolean;
  onDetect: (value: string) => void;
  /** Decodificação morreu de vez — a portaria precisa saber, não adivinhar. */
  onReaderError?: () => void;
}

/**
 * Câmera da portaria. Composição de dois hooks com responsabilidade
 * separada — ciclo de vida (`useCameraStream`) e estratégia de
 * decodificação (`useBarcodeScan` + `lib/barcode-decoder`) — para não
 * amontoar as duas coisas num arquivo só.
 */
export function QRScanner({ active, onDetect, onReaderError }: QRScannerProps) {
  const { videoRef, status } = useCameraStream();
  useBarcodeScan({
    videoRef,
    active: active && status === "ready",
    onDetect,
    onError: onReaderError,
  });

  if (status === "denied" || status === "unsupported") {
    return (
      <div
        role="status"
        className="flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/40 p-6 text-center text-sm text-muted-foreground"
      >
        <CameraOff className="h-8 w-8" aria-hidden="true" />
        <p>{messages.checkin.cameraDenied}</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-black">
      <video
        ref={videoRef}
        className="h-full w-full object-cover"
        muted
        playsInline
        aria-label="Pré-visualização da câmera para leitura do QR code do ingresso"
      />
      {status === "requesting" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm text-white">
          Solicitando acesso à câmera…
        </div>
      )}
    </div>
  );
}
