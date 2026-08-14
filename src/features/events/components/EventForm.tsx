"use client";

import { Form, FormRootError } from "@/components/form/Form";
import { FormDateTime } from "@/components/form/FormDateTime";
import { FormInput } from "@/components/form/FormInput";
import { FormMoney } from "@/components/form/FormMoney";
import { FormNumber } from "@/components/form/FormNumber";
import { FormTextarea } from "@/components/form/FormTextarea";
import { Button } from "@/components/ui/button";

import { eventFormSchema, type EventFormValues } from "../lib/event-form-schema";
import { ApplyEventFormError } from "./ApplyEventFormError";

interface EventFormProps {
  defaultValues: Partial<EventFormValues>;
  onSubmit: (values: EventFormValues) => void;
  isSubmitting: boolean;
  error?: unknown;
  submitLabel: string;
  /** Capacidade só muda enquanto o evento está em DRAFT (409 depois de
   * publicado) — quando travada, o campo nem aparece como editável. */
  capacityLocked?: boolean;
}

/** Formulário de criar/editar evento — os dois fluxos usam exatamente os
 * mesmos campos, então um único componente parametrizado evita duplicar a
 * tela inteira só por causa do rótulo do botão e da trava de capacidade. */
export function EventForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  error,
  submitLabel,
  capacityLocked = false,
}: EventFormProps) {
  return (
    <Form schema={eventFormSchema} defaultValues={defaultValues} onSubmit={onSubmit}>
      <ApplyEventFormError error={error} />
      <FormRootError />
      <FormInput name="title" label="Título" />
      <FormTextarea name="description" label="Descrição" description="Opcional" rows={3} />
      <FormInput
        name="imageUrl"
        label="URL da imagem"
        description="Opcional"
        placeholder="https://…"
      />
      <FormDateTime name="date" label="Data e hora" />
      <FormInput name="venue" label="Local" />
      <div className="grid grid-cols-2 gap-4">
        {capacityLocked ? (
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Capacidade</span>
            <p className="text-sm text-muted-foreground">
              {defaultValues.capacity} lugares — só muda enquanto o evento está em rascunho.
            </p>
          </div>
        ) : (
          <FormNumber name="capacity" label="Capacidade" min={1} max={500} />
        )}
        <FormMoney name="price" label="Preço" />
      </div>
      <Button type="submit" disabled={isSubmitting} className="self-start">
        {isSubmitting ? "Salvando…" : submitLabel}
      </Button>
    </Form>
  );
}
