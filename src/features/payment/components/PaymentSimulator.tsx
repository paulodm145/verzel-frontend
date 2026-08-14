"use client";

import { useState } from "react";

import { CheckCircle2Icon, CreditCardIcon, WalletIcon, XCircleIcon } from "lucide-react";

import { isApiError } from "@/lib/api-errors";
import { messages } from "@/lib/messages";

import { Button } from "@/components/ui/button";

import { useSimulatePayment } from "../hooks/useSimulatePayment";
import type { PaymentMethod, PaymentResult } from "../types";

interface PaymentSimulatorProps {
  reservationId: string;
  onApproved: (result: PaymentResult) => void;
}

/**
 * Não existe gateway real (04-reserva-e-pagamento.md) — o campo `simulate`
 * existe justamente para demonstrar o caminho da recusa, então os dois
 * botões (aprovar/recusar) ficam lado a lado, sempre visíveis, em vez de
 * escondidos atrás de um formulário de cartão de mentira.
 */
export function PaymentSimulator({ reservationId, onApproved }: PaymentSimulatorProps) {
  const [method, setMethod] = useState<PaymentMethod>("CREDIT_CARD");
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const { mutate, isPending } = useSimulatePayment();

  function simulate(outcome: "APPROVED" | "REFUSED") {
    setNotice(null);
    mutate(
      { reservationId, paymentMethod: method, simulate: outcome },
      {
        onSuccess: ({ payment, replayed }) => {
          // O resultado em si sempre se aplica (a reserva realmente está
          // CONFIRMED/PENDING) — só o aviso de sucesso é que não se repete.
          // Clicou duas vezes e a segunda foi só a resposta reproduzida da
          // primeira: a operação não aconteceu de novo, o usuário só clicou
          // duas vezes.
          if (payment.status === "APPROVED") {
            onApproved(payment);
            if (!replayed)
              setNotice({ tone: "success", message: "Pagamento aprovado! Ingresso emitido." });
          } else if (!replayed) {
            setNotice({ tone: "error", message: messages.payment.refused });
          }
        },
        onError: (error) => {
          setNotice({
            tone: "error",
            message: isApiError(error) ? error.message : messages.network.unexpected,
          });
        },
      },
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Pagamento (simulado)</p>
        <p className="text-xs text-muted-foreground">
          Sem gateway real nesta API — escolha o resultado para demonstrar os dois caminhos.
        </p>
      </div>

      <div className="flex gap-1.5" role="radiogroup" aria-label="Forma de pagamento">
        <Button
          type="button"
          variant={method === "CREDIT_CARD" ? "secondary" : "outline"}
          size="sm"
          aria-pressed={method === "CREDIT_CARD"}
          disabled={isPending}
          onClick={() => setMethod("CREDIT_CARD")}
        >
          <CreditCardIcon aria-hidden="true" /> Cartão
        </Button>
        <Button
          type="button"
          variant={method === "PIX" ? "secondary" : "outline"}
          size="sm"
          aria-pressed={method === "PIX"}
          disabled={isPending}
          onClick={() => setMethod("PIX")}
        >
          <WalletIcon aria-hidden="true" /> PIX
        </Button>
      </div>

      <div className="flex gap-2">
        <Button type="button" disabled={isPending} onClick={() => simulate("APPROVED")}>
          Aprovar pagamento
        </Button>
        <Button
          type="button"
          variant="destructive"
          disabled={isPending}
          onClick={() => simulate("REFUSED")}
        >
          Recusar pagamento
        </Button>
      </div>

      {notice && (
        <p
          role="status"
          className={
            notice.tone === "success"
              ? "flex items-center gap-1.5 text-sm text-primary"
              : "flex items-center gap-1.5 text-sm text-destructive"
          }
        >
          {notice.tone === "success" ? (
            <CheckCircle2Icon className="size-4 shrink-0" aria-hidden="true" />
          ) : (
            <XCircleIcon className="size-4 shrink-0" aria-hidden="true" />
          )}
          {notice.message}
        </p>
      )}
    </div>
  );
}
