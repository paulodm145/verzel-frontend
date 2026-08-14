import { cn } from "@/lib/utils";

import type { SeatRow } from "./seat-grouping";

interface SeatMapRowProps {
  row: SeatRow;
}

/** Uma fileira do mapa: rótulo da letra + um "selo" por assento. */
export function SeatMapRow({ row }: SeatMapRowProps) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="w-4 shrink-0 text-right text-xs font-medium text-muted-foreground">
        {row.row}
      </span>
      <div className="flex flex-wrap gap-1">
        {row.seats.map((seat) => (
          <span
            key={seat.id}
            role="img"
            aria-label={`Assento ${seat.label}, ${seat.available ? "disponível" : "ocupado"}`}
            title={`${seat.label} — ${seat.available ? "disponível" : "ocupado"}`}
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] border text-[10px] font-medium select-none",
              seat.available
                ? "border-border bg-background text-foreground"
                : "border-transparent bg-muted text-muted-foreground/50 line-through",
            )}
          >
            {seat.label.slice(1)}
          </span>
        ))}
      </div>
    </div>
  );
}
