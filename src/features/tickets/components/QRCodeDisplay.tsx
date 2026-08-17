"use client";

import { QRCodeSVG } from "qrcode.react";

interface QRCodeDisplayProps {
  /** URL pública do ingresso (`/ticket/TKT-…`) — ver lib/share-url.ts. */
  value: string;
  size?: number;
}

/**
 * Desenho do QR (05-ingressos-e-portaria.md). `level="M"` e `marginSize={4}`
 * são a combinação medida no doc — não estimada — como a que sobrevive a
 * uma câmera de celular sob luz ruim na porta. Sempre num retângulo branco:
 * o cartão pode estar em dark mode, o QR nunca pode.
 */
export function QRCodeDisplay({ value, size = 280 }: QRCodeDisplayProps) {
  return (
    <div
      className="inline-flex rounded-md bg-white p-3"
      role="img"
      aria-label="Código QR do ingresso"
    >
      <QRCodeSVG value={value} size={size} level="M" marginSize={4} />
    </div>
  );
}
