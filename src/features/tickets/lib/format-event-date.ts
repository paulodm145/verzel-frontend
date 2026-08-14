/** Datas da API são ISO UTC — sempre exibidas no fuso do evento (CLAUDE.md). */
const formatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export function formatEventDate(iso: string): string {
  return formatter.format(new Date(iso));
}
