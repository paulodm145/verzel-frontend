"use client";

import { SearchIcon } from "lucide-react";

import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import type { CatalogItem } from "../types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "America/Sao_Paulo",
});

interface CatalogSearchResultsProps {
  /** Termo já sem espaços nas pontas — usado só para decidir qual estado mostrar. */
  query: string;
  items: CatalogItem[] | undefined;
  isLoading: boolean;
  error: unknown;
  onSelect: (item: CatalogItem) => void;
}

/** Lista de resultados do catálogo, com os quatro estados que a busca pode
 * assumir: abaixo do mínimo, carregando, erro, vazio (que não é erro — ver
 * 03-eventos-e-catalogo.md) e populado. */
export function CatalogSearchResults({
  query,
  items,
  isLoading,
  error,
  onSelect,
}: CatalogSearchResultsProps) {
  if (query.length < 2) {
    return (
      <EmptyState
        icon={SearchIcon}
        title="Digite ao menos 2 caracteres"
        description="Busque pelo nome do show ou filme para começar."
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="h-16 w-full" />
        ))}
      </div>
    );
  }

  if (error) return <ErrorState error={error} />;

  if (!items || items.length === 0) {
    return (
      <EmptyState
        title="Nenhum resultado"
        description="Tente outro termo — um provedor fora do ar não impede o outro de responder."
      />
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li
          key={`${item.provider}-${item.externalId}`}
          className="flex items-center gap-3 rounded-lg border border-border p-2"
        >
          {item.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- imagem de provedor externo (Ticketmaster/TMDb), não vale configurar domínio remoto para uma miniatura de busca.
            <img src={item.imageUrl} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
          ) : (
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded bg-muted text-[0.65rem] text-muted-foreground">
              Sem imagem
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="text-xs text-muted-foreground">
              {item.sourceType === "MOVIE" ? "Filme" : "Show"}
              {" · "}
              {item.date ? dateFormatter.format(new Date(item.date)) : "Data a definir"}
            </p>
          </div>
          <Button size="sm" onClick={() => onSelect(item)}>
            Selecionar
          </Button>
        </li>
      ))}
    </ul>
  );
}
