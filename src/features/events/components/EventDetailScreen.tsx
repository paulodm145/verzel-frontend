"use client";

import { AsyncBoundary } from "@/components/feedback/AsyncBoundary";
import { ErrorState } from "@/components/feedback/ErrorState";
import { PageHeader } from "@/components/layout/PageHeader";
import { useConfirm } from "@/components/modal/useConfirm";
import { Button } from "@/components/ui/button";

import { useOrganizerEvent } from "../hooks/useOrganizerEvent";
import { useCancelEvent, usePublishEvent } from "../hooks/usePublishOrCancelEvent";
import { useUpdateEvent } from "../hooks/useUpdateEvent";
import { eventToFormValues, toUpdateEventInput } from "../lib/event-form-schema";
import { EventForm } from "./EventForm";
import { EventStatusBadge } from "./EventStatusBadge";

/** Tela `/dashboard/[id]`: edição (PATCH) + publicar/cancelar, os dois atrás
 * de `useConfirm()` — são ações que tiram o evento de circulação ou o
 * colocam à venda, não algo para disparar num clique sem confirmação. */
export function EventDetailScreen({ id }: { id: string }) {
  const eventQuery = useOrganizerEvent(id);
  const updateEvent = useUpdateEvent(id);
  const publishEvent = usePublishEvent();
  const cancelEvent = useCancelEvent();
  const confirm = useConfirm();

  async function handlePublish() {
    const confirmed = await confirm({
      title: "Publicar evento",
      description: "O evento passa a aparecer na listagem pública imediatamente.",
      confirmLabel: "Publicar",
    });
    if (confirmed) publishEvent.mutate(id);
  }

  async function handleCancel() {
    const confirmed = await confirm({
      title: "Cancelar evento",
      description: "Esta ação não pode ser desfeita.",
      confirmLabel: "Cancelar evento",
      tone: "destructive",
    });
    if (confirmed) cancelEvent.mutate(id);
  }

  return (
    <AsyncBoundary
      isLoading={eventQuery.isLoading}
      error={eventQuery.error}
      onRetry={() => void eventQuery.refetch()}
    >
      {eventQuery.data && (
        <div className="flex flex-col gap-4">
          <PageHeader
            eyebrow="Gestão · Evento"
            title={eventQuery.data.title}
            titleBadge={<EventStatusBadge status={eventQuery.data.status} />}
            actions={
              <>
                {eventQuery.data.status === "DRAFT" && (
                  <Button onClick={() => void handlePublish()} disabled={publishEvent.isPending}>
                    Publicar
                  </Button>
                )}
                {eventQuery.data.status !== "CANCELED" && (
                  <Button
                    variant="destructive"
                    onClick={() => void handleCancel()}
                    disabled={cancelEvent.isPending}
                  >
                    Cancelar evento
                  </Button>
                )}
              </>
            }
          />

          {(publishEvent.error ?? cancelEvent.error) != null && (
            <ErrorState error={publishEvent.error ?? cancelEvent.error} />
          )}

          <EventForm
            defaultValues={eventToFormValues(eventQuery.data)}
            capacityLocked={eventQuery.data.status !== "DRAFT"}
            isSubmitting={updateEvent.isPending}
            error={updateEvent.error}
            submitLabel="Salvar alterações"
            onSubmit={(values) => {
              const capacityLocked = eventQuery.data.status !== "DRAFT";
              updateEvent.mutate(toUpdateEventInput(values, capacityLocked));
            }}
          />
        </div>
      )}
    </AsyncBoundary>
  );
}
