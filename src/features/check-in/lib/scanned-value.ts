/**
 * Traduz o que a câmera leu no corpo que `POST /gate/validate` espera.
 *
 * O QR do ingresso carrega a URL pública `/ticket/TKT-…`, para que a câmera
 * nativa de qualquer celular abra algo legível. A portaria, lendo a mesma
 * imagem, extrai o código dali e valida por `code` — o endpoint aceita
 * `qrContent` **ou** `code` (05-ingressos-e-portaria.md).
 *
 * Aceitar também o token assinado cru não é zelo inútil: ingressos emitidos
 * antes desta mudança seguem em circulação com o QR antigo, e a portaria não
 * pode recusar um ingresso legítimo por causa da data em que foi comprado.
 */
const TICKET_CODE = /TKT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}/i;

export type ScannedTicket = { code: string } | { qrContent: string };

export function parseScannedValue(value: string): ScannedTicket | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // QR novo: URL da página pública. O código é o último segmento, mas casar
  // por padrão é mais robusto que fatiar o caminho — a URL pode ganhar
  // barra final, query de rastreio ou prefixo de domínio diferente.
  if (/^https?:\/\//i.test(trimmed)) {
    const match = trimmed.match(TICKET_CODE);
    return match ? { code: match[0].toUpperCase() } : null;
  }

  // Código digitado ou lido de um QR que só tem o código.
  if (TICKET_CODE.test(trimmed) && trimmed.length <= 20) {
    return { code: trimmed.toUpperCase() };
  }

  // Sobrou o token assinado dos ingressos antigos.
  return { qrContent: trimmed };
}
