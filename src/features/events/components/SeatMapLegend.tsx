export function SeatMapLegend() {
  return (
    <div className="flex items-center gap-4 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span
          className="h-3 w-3 rounded-[3px] border border-border bg-background"
          aria-hidden="true"
        />
        Disponível
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-[3px] bg-muted" aria-hidden="true" />
        Ocupado
      </span>
    </div>
  );
}
