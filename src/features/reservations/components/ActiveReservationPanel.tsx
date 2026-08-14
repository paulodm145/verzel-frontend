"use client";

import { useConfirm } from "@/components/modal/useConfirm";
import { Button } from "@/components/ui/button";
import { PaymentSimulator } from "@/features/payment/components/PaymentSimulator";
import type { PaymentResult } from "@/features/payment/types";

import { useCancelReservation } from "../hooks/useCancelReservation";
import type { Reservation } from "../types";
import { ReservationCountdown } from "./ReservationCountdown";

interface ActiveReservationPanelProps {
  reservation: Reservation;
  onExpire: () => void;
  onCanceled: () => void;
  onApproved: (result: PaymentResult) => void;
}

/** Etapa 2 do checkout: reserva `PENDING` segurando o assento por 10 minutos,
 * com o simulador de pagamento e a opção de desistir. */
export function ActiveReservationPanel({
  reservation,
  onExpire,
  onCanceled,
  onApproved,
}: ActiveReservationPanelProps) {
  const confirm = useConfirm();
  const { mutate: cancel, isPending: isCanceling } = useCancelReservation();

  async function handleGiveUp() {
    const confirmed = await confirm({
      title: "Desistir deste assento?",
      description: `O assento ${reservation.seatLabel} volta a ficar disponível para outra pessoa na hora.`,
      confirmLabel: "Desistir",
      tone: "destructive",
    });
    if (!confirmed) return;

    cancel(reservation.id, { onSuccess: onCanceled });
  }

  return (
    <div className="flex flex-col gap-4 rounded-lg border border-border bg-muted/30 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-foreground">
            Assento {reservation.seatLabel} reservado
          </p>
          <ReservationCountdown expiresAt={reservation.expiresAt} onExpire={onExpire} />
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isCanceling}
          onClick={() => void handleGiveUp()}
        >
          Desistir deste assento
        </Button>
      </div>

      <PaymentSimulator reservationId={reservation.id} onApproved={onApproved} />
    </div>
  );
}
