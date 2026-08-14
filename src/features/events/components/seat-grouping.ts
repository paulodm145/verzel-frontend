import type { Seat } from "../types";

export interface SeatRow {
  row: string;
  seats: Seat[];
}

/** Extrai o número do rótulo ("A10" -> 10) para ordenar a fileira numericamente. */
function seatNumber(label: string): number {
  return Number.parseInt(label.slice(1), 10);
}

/**
 * Agrupa os assentos pela primeira letra do rótulo (A1…A20, B1…), como
 * sugerido em docs/doc-frontend/03-eventos-e-catalogo.md via
 * `Object.groupBy`. Reimplementado manualmente (em vez do `Object.groupBy`
 * do doc) para não depender do polyfill/lib mais recente do TS, e porque a
 * API não garante a ordem dos itens — "A10" chega antes de "A2" na resposta
 * real (ordenação de string), então cada fileira é reordenada aqui pelo
 * número do assento, não pela ordem de chegada.
 */
export function groupSeatsByRow(seats: Seat[]): SeatRow[] {
  const byRow = new Map<string, Seat[]>();

  for (const seat of seats) {
    const row = seat.label.charAt(0);
    const seatsInRow = byRow.get(row) ?? [];
    seatsInRow.push(seat);
    byRow.set(row, seatsInRow);
  }

  return Array.from(byRow.entries())
    .sort(([rowA], [rowB]) => rowA.localeCompare(rowB))
    .map(([row, seatsInRow]) => ({
      row,
      seats: [...seatsInRow].sort((a, b) => seatNumber(a.label) - seatNumber(b.label)),
    }));
}
