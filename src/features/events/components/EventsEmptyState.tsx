import { CalendarSearch } from "lucide-react";

interface EventsEmptyStateProps {
  search?: string;
}

export function EventsEmptyState({ search }: EventsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-4 py-10 text-center">
      <CalendarSearch className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">Nenhum evento encontrado</p>
      <p className="text-xs text-muted-foreground">
        {search
          ? `Não há eventos publicados para "${search}".`
          : "Ainda não há eventos publicados."}
      </p>
    </div>
  );
}
