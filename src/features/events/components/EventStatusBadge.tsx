import { CircleCheck, CircleDashed, CircleSlash, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { EventStatus } from "../types";

const STATUS_META: Record<EventStatus, { label: string; icon: LucideIcon; className: string }> = {
  DRAFT: { label: "Rascunho", icon: CircleDashed, className: "bg-muted text-muted-foreground" },
  PUBLISHED: { label: "Publicado", icon: CircleCheck, className: "bg-primary/10 text-primary" },
  CANCELED: {
    label: "Cancelado",
    icon: CircleSlash,
    className: "bg-destructive/10 text-destructive",
  },
};

/**
 * Selo de status sóbrio — fundo suave + ícone + texto, sem gradiente nem
 * pill de SaaS genérico. O ícone não é enfeite: é a mesma regra dos quatro
 * estados da portaria, onde cor sozinha falha para daltônicos. Numa coluna de
 * tabela, "rascunho" e "cancelado" precisam se distinguir sem depender do
 * matiz.
 */
export function EventStatusBadge({ status }: { status: EventStatus }) {
  const { label, icon: Icon, className } = STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-xs font-medium",
        className,
      )}
    >
      <Icon className="size-3.5 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}
