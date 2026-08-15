import Link from "next/link";

import { CheckCircle2Icon } from "lucide-react";

import { Button } from "@/components/ui/button";

interface TicketIssuedPanelProps {
  seatLabel: string;
}

/** Etapa final: pagamento aprovado, ingresso emitido. A busca do ingresso em
 * si (QR, `/my-tickets`) é da epic 05 — aqui só confirma e encaminha. */
export function TicketIssuedPanel({ seatLabel }: TicketIssuedPanelProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-10 text-center">
      <CheckCircle2Icon className="size-10 text-primary" aria-hidden="true" />
      <div>
        <p className="text-base font-medium text-foreground">
          Ingresso emitido para o assento {seatLabel}
        </p>
        <p className="text-sm text-muted-foreground">
          O QR code já está disponível em Meus Ingressos.
        </p>
      </div>
      <Button nativeButton={false} render={<Link href="/my-tickets" />}>
        Ver meus ingressos
      </Button>
    </div>
  );
}
