/** Formatação pt-BR compartilhada pelas telas de eventos (CLAUDE.md, convenção de formatação). */

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
  timeZone: "America/Sao_Paulo",
  dateStyle: "short",
  timeStyle: "short",
});

export function formatEventPrice(price: number): string {
  return currencyFormatter.format(price);
}

/** `date` pode vir null quando o provedor externo não informa data. */
export function formatEventDate(date: string | null): string {
  if (!date) return "Data a confirmar";
  return dateTimeFormatter.format(new Date(date));
}
