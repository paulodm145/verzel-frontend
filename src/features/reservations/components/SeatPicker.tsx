"use client";

import { CheckIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { Seat } from "../lib/seat-map-adapter";

interface SeatPickerProps {
  seats: Seat[];
  selectedSeatId: string | null;
  onSelect: (seat: Seat) => void;
  /** Trava a escolha durante a chamada de reserva — evita clicar noutro
   * assento enquanto a primeira tentativa ainda está em voo. */
  disabled?: boolean;
}

/** Agrupa por fileira (primeira letra do rótulo) — mesma regra sugerida em
 * `03-eventos-e-catalogo.md` (`Object.groupBy` por `label[0]`). */
function groupByRow(seats: Seat[]): [string, Seat[]][] {
  const rows = new Map<string, Seat[]>();
  for (const seat of seats) {
    const row = seat.label[0] ?? "?";
    const bucket = rows.get(row);
    if (bucket) bucket.push(seat);
    else rows.set(row, [seat]);
  }
  return [...rows.entries()].sort(([a], [b]) => a.localeCompare(b));
}

function seatNumber(label: string): string {
  return label.slice(1);
}

/**
 * Mapa denso, não decorativo: rótulo em texto dentro de um botão quadrado,
 * sem ícone de poltrona por assento (30 ícones repetidos pesam mais do que
 * ajudam numa grade densa). O estado de cada assento não depende só de cor —
 * ocupado ganha `line-through` e `disabled`, selecionado ganha um ícone de
 * check — para não falhar para quem não distingue vermelho de verde.
 */
export function SeatPicker({ seats, selectedSeatId, onSelect, disabled }: SeatPickerProps) {
  const rows = groupByRow(seats);

  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Mapa de assentos">
      {rows.map(([row, rowSeats]) => (
        <div key={row} className="flex items-center gap-2">
          <span className="w-4 shrink-0 text-xs font-medium text-muted-foreground">{row}</span>
          <div className="flex flex-wrap gap-1.5">
            {rowSeats
              .slice()
              .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }))
              .map((seat) => {
                const isSelected = seat.id === selectedSeatId;
                const isDisabled = !seat.available || disabled;

                return (
                  <button
                    key={seat.id}
                    type="button"
                    disabled={isDisabled}
                    aria-pressed={isSelected}
                    aria-label={`Assento ${seat.label}${
                      !seat.available ? ", ocupado" : isSelected ? ", selecionado" : ", disponível"
                    }`}
                    onClick={() => onSelect(seat)}
                    className={cn(
                      "flex size-8 items-center justify-center rounded-md border text-xs font-medium tabular-nums transition-colors disabled:cursor-not-allowed",
                      !seat.available &&
                        "border-transparent bg-muted text-muted-foreground/50 line-through",
                      seat.available &&
                        !isSelected &&
                        "border-border bg-background hover:border-primary hover:text-primary disabled:opacity-60",
                      isSelected && "border-primary bg-primary text-primary-foreground",
                    )}
                  >
                    {isSelected ? (
                      <CheckIcon className="size-3.5" aria-hidden="true" />
                    ) : (
                      seatNumber(seat.label)
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      ))}
    </div>
  );
}
