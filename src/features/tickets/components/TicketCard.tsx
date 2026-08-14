"use client";

import { useState } from "react";

import { CalendarDays, CheckCircle2, MapPin, Share2, TicketCheck } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

import { formatEventDate } from "../lib/format-event-date";
import type { Ticket } from "../types";
import { QRCodeDisplay } from "./QRCodeDisplay";

const STATUS_LABEL: Record<Ticket["status"], string> = {
  VALID: "Válido",
  USED: "Utilizado",
};

/**
 * Cartão do ingresso em `/my-tickets`. Recebe o `Ticket` inteiro com o
 * `event` embutido — nunca busca dado por fora dele (07-performance.md).
 * O QR fica visível direto no cartão: é a tela que a pessoa mostra na
 * catraca, não um detalhe que vale esconder atrás de um clique a mais.
 */
export function TicketCard({ ticket }: { ticket: Ticket }) {
  const [shared, setShared] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({
        title: `Ingresso — ${ticket.event.title}`,
        url: ticket.shareUrl,
      });
      return;
    }
    await navigator.clipboard.writeText(ticket.shareUrl);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  }

  const isUsed = ticket.status === "USED";

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-start">
      {/* 256–320px é faixa medida no doc (05-ingressos-e-portaria.md) — não
          reduzir para caber no card, a câmera na porta é quem paga o preço. */}
      <QRCodeDisplay value={ticket.qrContent} size={256} />

      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <h2 className="truncate text-base font-semibold tracking-tight">{ticket.event.title}</h2>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
              isUsed
                ? "bg-muted text-muted-foreground"
                : "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400",
            )}
          >
            {isUsed ? (
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <TicketCheck className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {STATUS_LABEL[ticket.status]}
          </span>
        </div>

        <dl className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm text-muted-foreground sm:grid-cols-2">
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <dd>{formatEventDate(ticket.event.date)}</dd>
          </div>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <dd className="truncate">{ticket.event.venue}</dd>
          </div>
        </dl>

        <p className="text-sm">
          Assento <span className="font-semibold">{ticket.seatLabel}</span>
        </p>

        {isUsed && ticket.usedAt && (
          <p className="text-xs text-muted-foreground">
            Entrada em {formatEventDate(ticket.usedAt)}
          </p>
        )}

        <p className="font-mono text-lg tracking-widest">{ticket.code}</p>

        <div className="mt-1 flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="h-3.5 w-3.5" aria-hidden="true" />
            {shared ? "Link copiado" : "Compartilhar"}
          </Button>
          <p className="text-xs text-muted-foreground">Quem tiver o link acessa o ingresso.</p>
        </div>
      </div>
    </article>
  );
}
