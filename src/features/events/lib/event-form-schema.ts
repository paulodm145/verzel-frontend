import { z } from "zod";

import type { CatalogItem } from "@/features/catalog/types";

import type { CreateEventInput, Event, UpdateEventInput } from "../types";

/**
 * Campos de texto ficam sempre como `string` (nunca `null`/`undefined`) no
 * formulário — é o que `FormInput`/`FormTextarea` esperam de um valor
 * controlado. A conversão para `null` (o que a API aceita para `description`
 * e `imageUrl`) acontece só na hora de montar o corpo da requisição, em
 * `toEventPayload`.
 */
export const eventFormSchema = z.object({
  title: z.string().min(1, "Informe o título do evento.").max(200, "Título muito longo."),
  description: z.string().max(2000, "Descrição muito longa."),
  imageUrl: z.union([z.url("Informe uma URL válida."), z.literal("")]),
  date: z.string().min(1, "Informe a data e hora do evento."),
  venue: z.string().min(1, "Informe o local do evento.").max(200, "Local muito longo."),
  capacity: z
    .number("Informe a capacidade.")
    .int("Capacidade deve ser um número inteiro.")
    .min(1, "Capacidade mínima é 1.")
    .max(500, "Capacidade máxima é 500."),
  price: z.number("Informe o preço.").min(0, "Preço não pode ser negativo."),
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

/** Valores iniciais a partir de um evento existente — tela de edição. */
export function eventToFormValues(event: Event): EventFormValues {
  return {
    title: event.title,
    description: event.description ?? "",
    imageUrl: event.imageUrl ?? "",
    date: event.date ?? "",
    venue: event.venue,
    capacity: event.capacity,
    price: event.price,
  };
}

/** Valores iniciais a partir de um item do catálogo — tela de criação.
 * `venue`/`capacity`/`price` não vêm do catálogo; ficam em branco para o
 * organizador preencher conscientemente (nenhum "30 lugares" adivinhado). */
export function catalogItemToFormDefaults(item: CatalogItem): Partial<EventFormValues> {
  return {
    title: item.title,
    description: item.description ?? "",
    imageUrl: item.imageUrl ?? "",
    date: item.date ?? "",
    venue: "",
  };
}

/** Corpo comum a criação e edição — strings vazias viram `null`, o que a API
 * aceita para `description`/`imageUrl` (`date`/`title`/`venue` são exigidos
 * pelo schema e nunca chegam vazios aqui). */
export function toEventPayload(values: EventFormValues) {
  return {
    title: values.title.trim(),
    description: values.description.trim() === "" ? null : values.description.trim(),
    imageUrl: values.imageUrl.trim() === "" ? null : values.imageUrl.trim(),
    date: values.date,
    venue: values.venue.trim(),
    capacity: values.capacity,
    price: values.price,
  };
}

export function toCreateEventInput(
  values: EventFormValues,
  catalogItem: Pick<CatalogItem, "externalId" | "sourceType">,
): CreateEventInput {
  return {
    ...toEventPayload(values),
    externalId: catalogItem.externalId,
    sourceType: catalogItem.sourceType,
  };
}

/**
 * `capacityLocked` reflete a regra de negócio "capacidade só muda enquanto
 * DRAFT" (409 se tentar depois de publicado) — omitimos a chave inteira do
 * PATCH em vez de reenviar o valor atual, porque a API rejeita a presença do
 * campo, não só a mudança de valor.
 */
export function toUpdateEventInput(
  values: EventFormValues,
  capacityLocked: boolean,
): UpdateEventInput {
  const { capacity, ...rest } = toEventPayload(values);
  return capacityLocked ? rest : { ...rest, capacity };
}
