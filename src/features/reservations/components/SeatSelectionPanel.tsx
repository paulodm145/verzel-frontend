"use client";

import { isApiError } from "@/lib/api-errors";
import { messages } from "@/lib/messages";

import { Button } from "@/components/ui/button";

import type { Seat } from "../lib/seat-map-adapter";
import { SeatPicker } from "./SeatPicker";

interface SeatSelectionPanelProps {
  seats: Seat[];
  selectedSeat: Seat | null;
  onSelectSeat: (seat: Seat) => void;
  onReserve: () => void;
  isReserving: boolean;
  reserveError: unknown;
}

/** Etapa 1 do checkout: escolher um assento livre e confirmar a intenção de
 * reservá-lo. Separado do orquestrador só para manter os arquivos abaixo de
 * ~200 linhas (spec 000, seção 3). */
export function SeatSelectionPanel({
  seats,
  selectedSeat,
  onSelectSeat,
  onReserve,
  isReserving,
  reserveError,
}: SeatSelectionPanelProps) {
  return (
    <div className="flex flex-col gap-4">
      <SeatPicker
        seats={seats}
        selectedSeatId={selectedSeat?.id ?? null}
        onSelect={onSelectSeat}
        disabled={isReserving}
      />

      {reserveError ? (
        <p
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {isApiError(reserveError) ? reserveError.message : messages.network.unexpected}
        </p>
      ) : null}

      <div className="flex items-center gap-3">
        <Button type="button" disabled={!selectedSeat || isReserving} onClick={onReserve}>
          {isReserving
            ? "Reservando…"
            : selectedSeat
              ? `Reservar assento ${selectedSeat.label}`
              : "Selecione um assento"}
        </Button>
        {selectedSeat && !isReserving && (
          <span className="text-xs text-muted-foreground">
            A reserva vale por 10 minutos — dá tempo de simular o pagamento com calma.
          </span>
        )}
      </div>
    </div>
  );
}
