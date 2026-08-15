"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CatalogSearchResults } from "@/features/catalog/components/CatalogSearchResults";
import { useCatalogSearch } from "@/features/catalog/hooks/useCatalogSearch";
import type { CatalogItem } from "@/features/catalog/types";

import { useCreateEvent } from "../hooks/useCreateEvent";
import { catalogItemToFormDefaults, toCreateEventInput } from "../lib/event-form-schema";
import { EventForm } from "./EventForm";

/** Tela `/dashboard/new`: busca no catálogo -> escolhe um item -> preenche o
 * restante do evento -> `POST /events` (nasce DRAFT). */
export function NewEventScreen() {
  const [term, setTerm] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<CatalogItem | null>(null);

  const search = useCatalogSearch(term, page);
  const createEvent = useCreateEvent();
  const router = useRouter();

  if (selected) {
    return (
      <div className="flex flex-col gap-4">
        <PageHeader
          eyebrow="Gestão · Novo evento"
          title="Detalhes do evento"
          description="Ajuste data, local, capacidade e preço antes de criar."
        />
        <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-3">
          <div>
            <p className="text-sm font-medium">{selected.title}</p>
            <p className="text-xs text-muted-foreground">
              {selected.sourceType === "MOVIE" ? "Filme" : "Show"} · {selected.provider}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setSelected(null)}>
            Trocar seleção
          </Button>
        </div>
        <EventForm
          defaultValues={catalogItemToFormDefaults(selected)}
          isSubmitting={createEvent.isPending}
          error={createEvent.error}
          submitLabel="Criar evento"
          onSubmit={(values) => {
            createEvent.mutate(toCreateEventInput(values, selected), {
              onSuccess: (event) => router.push(`/dashboard/${event.id}`),
            });
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        eyebrow="Gestão"
        title="Novo evento"
        description="Busque no catálogo (shows e filmes) e escolha um item para criar o evento."
      />
      <Input
        value={term}
        onChange={(event) => {
          setTerm(event.target.value);
          setPage(1);
        }}
        placeholder="Buscar show ou filme…"
        aria-label="Buscar no catálogo"
      />
      <CatalogSearchResults
        query={term.trim()}
        items={search.data?.items}
        isLoading={search.isFetching}
        error={search.error}
        onSelect={setSelected}
      />
      {(search.data?.items.length ?? 0) > 0 && (
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setPage((current) => Math.max(1, current - 1))}
          >
            Anterior
          </Button>
          <Button variant="outline" size="sm" onClick={() => setPage((current) => current + 1)}>
            Próxima
          </Button>
        </div>
      )}
    </div>
  );
}
