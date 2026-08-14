/** Máscara e validação do código `TKT-XXXX-XXXX-XXXX` (05-ingressos-e-portaria.md). */
const CODE_PATTERN = /^TKT-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/;

/**
 * Formata o que o operador digita para o padrão `TKT-XXXX-XXXX-XXXX`,
 * aceitando colar o código com ou sem o prefixo "TKT" e com ou sem hífens.
 */
export function formatTicketCode(raw: string): string {
  const stripped = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const withoutPrefix = stripped.startsWith("TKT") ? stripped.slice(3) : stripped;
  const chars = withoutPrefix.slice(0, 12);
  if (chars.length === 0) return "";
  const groups = chars.match(/.{1,4}/g) ?? [];
  return `TKT-${groups.join("-")}`;
}

export function isCompleteTicketCode(value: string): boolean {
  return CODE_PATTERN.test(value);
}
