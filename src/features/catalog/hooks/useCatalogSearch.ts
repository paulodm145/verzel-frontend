"use client";

import { useEffect, useState } from "react";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import { STALE_TIME } from "@/lib/query-client";

import { catalogService } from "../services/catalog-service";

const MIN_QUERY_LENGTH = 2;
/** 300–500 ms recomendado em 07-performance.md item 5 — meio do intervalo. */
const DEBOUNCE_MS = 400;

/**
 * Busca no catálogo externo: debounce de 400 ms, mínimo de 2 caracteres (a
 * API exige e responde 400 abaixo disso — nem tentamos), `staleTime` de 5
 * min (o backend já cacheia 10 min, buscar de novo no mesmo termo não gasta
 * cota) e cancelamento da requisição anterior via o `AbortSignal` que o
 * TanStack Query injeta em `queryFn` — ele aborta sozinho quando a query em
 * curso deixa de ser a mais recente (troca de termo/página, unmount).
 *
 * `page` começa em **1** — exceção proposital à paginação `skip`/`take` do
 * resto do app, porque o catálogo espelha a convenção das APIs externas que
 * consulta (Ticketmaster, TMDb).
 */
export function useCatalogSearch(rawQuery: string, page: number) {
  const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(rawQuery), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [rawQuery]);

  const query = debouncedQuery.trim();
  const enabled = query.length >= MIN_QUERY_LENGTH;

  return useQuery({
    queryKey: ["catalog", "search", query, page],
    queryFn: ({ signal }) => catalogService.search(query, page, signal),
    enabled,
    staleTime: STALE_TIME.catalog,
    placeholderData: keepPreviousData,
  });
}
