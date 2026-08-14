import type { Seat } from "../types";
import { groupSeatsByRow } from "./seat-grouping";
import { SeatMapLegend } from "./SeatMapLegend";
import { SeatMapRow } from "./SeatMapRow";

interface SeatMapProps {
  seats: Seat[];
  availableCount: number;
}

/**
 * Componente só de renderização — o agrupamento por fileira mora em
 * `seat-grouping.ts`, testável sem montar nada. É o mapa que o comprador
 * encara enquanto decide, então recebe atenção visual: fileiras alinhadas,
 * contagem de disponibilidade no topo, legenda explícita (cor sozinha falha
 * para daltônicos).
 */
export function SeatMap({ seats, availableCount }: SeatMapProps) {
  const rows = groupSeatsByRow(seats);

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-foreground">Mapa de assentos</h2>
        <span className="text-xs text-muted-foreground">
          {availableCount} de {seats.length} livres
        </span>
      </div>

      <div className="flex flex-col gap-1.5 overflow-x-auto pb-1">
        {rows.map((row) => (
          <SeatMapRow key={row.row} row={row} />
        ))}
      </div>

      <SeatMapLegend />
    </div>
  );
}
