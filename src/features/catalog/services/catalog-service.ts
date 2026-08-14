/**
 * Serviço do catálogo externo — só o organizador chama, na tela de criar
 * evento. Diferente de qualquer outra listagem do app: pagina com `page`
 * (começando em 1), não `skip`/`take` — segue a convenção das APIs externas
 * que ela espelha (03-eventos-e-catalogo.md).
 */
import { httpClient } from "@/lib/http-client";

import type { CatalogSearchResponse } from "../types";

export const catalogService = {
  async search(
    query: string,
    page: number,
    signal: AbortSignal | undefined,
  ): Promise<CatalogSearchResponse> {
    const { data } = await httpClient.get<CatalogSearchResponse>("/catalog/search", {
      params: { query, page },
      signal,
    });
    return data;
  },
};
