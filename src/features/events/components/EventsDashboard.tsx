"use client";

import Link from "next/link";
import { useState } from "react";

import { PlusIcon } from "lucide-react";

import { DataTable } from "@/components/data-table/DataTable";
import { EmptyState } from "@/components/feedback/EmptyState";
import { ErrorState } from "@/components/feedback/ErrorState";
import { useConfirm } from "@/components/modal/useConfirm";
import { Button } from "@/components/ui/button";

import { useMyEvents } from "../hooks/useMyEvents";
import { useCancelEvent, usePublishEvent } from "../hooks/usePublishOrCancelEvent";
import type { Event } from "../types";
import { dashboardEventColumns } from "./dashboard-columns";

const DEFAULT_TAKE = 20;

/** Tela `/dashboard`: DataTable sobre `GET /events/mine`, densidade de
 * ferramenta operacional — linhas compactas, ações inline, filtro no topo. */
export function EventsDashboard() {
  const [search, setSearch] = useState("");
  const [pagination, setPagination] = useState({ skip: 0, take: DEFAULT_TAKE });
  const [actionError, setActionError] = useState<unknown>(null);

  const query = useMyEvents({ search: search || undefined, ...pagination });
  const confirm = useConfirm();
  const publishEvent = usePublishEvent();
  const cancelEvent = useCancelEvent();

  async function handlePublish(event: Event) {
    const confirmed = await confirm({
      title: `Publicar "${event.title}"?`,
      description: "O evento passa a aparecer na listagem pública imediatamente.",
      confirmLabel: "Publicar",
    });
    if (!confirmed) return;

    setActionError(null);
    publishEvent.mutate(event.id, { onError: setActionError });
  }

  async function handleCancel(event: Event) {
    const confirmed = await confirm({
      title: `Cancelar "${event.title}"?`,
      description: "Esta ação não pode ser desfeita.",
      confirmLabel: "Cancelar evento",
      tone: "destructive",
    });
    if (!confirmed) return;

    setActionError(null);
    cancelEvent.mutate(event.id, { onError: setActionError });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">Meus eventos</h1>
          <p className="text-sm text-muted-foreground">Crie, publique e cancele seus eventos.</p>
        </div>
        <Button render={<Link href="/dashboard/new" />}>
          <PlusIcon />
          Novo evento
        </Button>
      </div>

      {actionError !== null && <ErrorState error={actionError} />}

      <DataTable
        columns={dashboardEventColumns}
        data={query.data?.items}
        totalCount={query.data?.total}
        pagination={{ ...pagination, onChange: setPagination }}
        isLoading={query.isLoading}
        error={query.error}
        toolbar={{
          search: true,
          searchPlaceholder: "Buscar por título…",
          onSearchChange: (value) => {
            setSearch(value);
            setPagination((current) => ({ ...current, skip: 0 }));
          },
        }}
        emptyState={
          <EmptyState
            title="Nenhum evento ainda"
            description="Crie seu primeiro evento a partir do catálogo."
            action={
              <Button size="sm" render={<Link href="/dashboard/new" />}>
                Novo evento
              </Button>
            }
          />
        }
        rowActions={(event) => [
          { label: "Editar", href: `/dashboard/${event.id}` },
          {
            label: "Publicar",
            onClick: () => void handlePublish(event),
            hidden: event.status !== "DRAFT",
          },
          {
            label: "Cancelar",
            onClick: () => void handleCancel(event),
            hidden: event.status === "CANCELED",
            variant: "destructive",
          },
        ]}
      />
    </div>
  );
}
