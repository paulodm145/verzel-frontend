/**
 * Link de compartilhamento do ingresso — montado aqui, não lido da API.
 *
 * O `shareUrl` que `GET /tickets/mine` devolve aponta para o host da própria
 * API (`.../tickets/TKT-...`), que responde **JSON**. É o único link que a API
 * consegue montar: ela não conhece o endereço deste frontend. Compartilhá-lo
 * manda o convidado para um objeto JSON em vez do ingresso.
 *
 * O destino certo é a página pública `/ticket/[code]` deste app, que existe
 * exatamente para isso. Mesma limitação (e mesma decisão) do `localStorage`
 * recomendado em `02-autenticacao.md`: o doc descreve o que a API pode fazer
 * sozinha, não o que este frontend deve fazer.
 */
export function ticketShareUrl(code: string, origin: string): string {
  return `${origin}/ticket/${code}`;
}
