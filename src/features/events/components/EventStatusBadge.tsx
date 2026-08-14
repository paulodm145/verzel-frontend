import { cn } from "@/lib/utils";

import type { EventStatus } from "../types";

const STATUS_META: Record<EventStatus, { label: string; className: string }> = {
  DRAFT: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  PUBLISHED: { label: "Publicado", className: "bg-primary/10 text-primary" },
  CANCELED: { label: "Cancelado", className: "bg-destructive/10 text-destructive" },
};

/** Selo de status sóbrio — cor de fundo suave + texto, sem gradiente nem
 * ícone decorativo: o espírito AdminLTE de badge de tabela, não um pill de
 * SaaS genérico. */
export function EventStatusBadge({ status }: { status: EventStatus }) {
  const meta = STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium",
        meta.className,
      )}
    >
      {meta.label}
    </span>
  );
}
