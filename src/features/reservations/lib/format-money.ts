const formatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** `price` já chega como número (Decimal convertido na borda da API) —
 * nunca string, nunca aritmética de ponto flutuante aqui. */
export function formatMoney(price: number): string {
  return formatter.format(price);
}
