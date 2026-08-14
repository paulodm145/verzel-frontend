"use client";

import { ArrowRightLeft, CheckCircle2, History, XCircle, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import type { GateValidateResponse, ValidationResultKind } from "../types";

interface ResultStyle {
  Icon: LucideIcon;
  label: string;
  /**
   * Cores dedicadas a esta tela, calibradas contra branco/preto e medidas
   * com a fórmula de contraste relativo do WCAG (não os tokens `--primary`
   * etc. do resto do app — ver relatório do epic para os números). Todos os
   * pares passam de 5:1, acima do mínimo de 4.5:1 para texto normal em AA.
   */
  className: string;
}

const RESULT_STYLE: Record<ValidationResultKind, ResultStyle> = {
  VALID: {
    Icon: CheckCircle2,
    label: "Entrada liberada",
    // 6.53:1 (claro) · 5.45:1 (escuro)
    className: "bg-[#146c2e] text-white dark:bg-[#16a34a] dark:text-[#0b1a0f]",
  },
  ALREADY_USED: {
    Icon: History,
    label: "Ingresso já utilizado",
    // 5.19:1 (claro) · 5.83:1 (escuro)
    className: "bg-[#a15c00] text-white dark:bg-[#d97706] dark:text-[#1a1200]",
  },
  WRONG_EVENT: {
    Icon: ArrowRightLeft,
    label: "Ingresso de outro evento",
    // 6.70:1 (claro) · 5.06:1 (escuro)
    className: "bg-[#1d4ed8] text-white dark:bg-[#3b82f6] dark:text-[#06122b]",
  },
  INVALID: {
    Icon: XCircle,
    label: "Ingresso inválido",
    // 6.47:1 (claro) · 5.01:1 (escuro)
    className: "bg-[#b91c1c] text-white dark:bg-[#ef4444] dark:text-[#240808]",
  },
};

function formatUsedAt(usedAt: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(usedAt));
}

interface ValidationResultProps {
  outcome: GateValidateResponse;
  onDismiss: () => void;
}

/**
 * Tela cheia dos 4 estados (spec 000, seção 5): cor **e** ícone próprios —
 * cor sozinha falha para daltônicos, e este é o momento de maior tensão do
 * fluxo, com fila esperando na porta. Não usa o `Button` do kit de
 * propósito: as cores aqui são dedicadas a este estado (fundo sólido cobrindo
 * a tela inteira), fora da paleta normal de botão do resto do app.
 */
export function ValidationResult({ outcome, onDismiss }: ValidationResultProps) {
  const style = RESULT_STYLE[outcome.result];
  const usedAtLabel = outcome.usedAt ? formatUsedAt(outcome.usedAt) : null;

  return (
    <div
      role="alertdialog"
      aria-label={style.label}
      aria-live="assertive"
      data-result={outcome.result}
      onClick={onDismiss}
      className={cn(
        "absolute inset-0 z-20 flex cursor-pointer flex-col items-center justify-center gap-4 p-6 text-center select-none",
        style.className,
      )}
    >
      <style.Icon
        className="h-28 w-28"
        aria-hidden="true"
        strokeWidth={1.5}
        data-testid="result-icon"
      />
      <p className="text-3xl font-bold">{style.label}</p>
      <p className="max-w-md text-lg">{outcome.message}</p>

      {outcome.ticket && (
        <div className="mt-2 flex flex-col gap-1 text-base">
          {outcome.ticket.holderName && (
            <p>
              <span className="font-semibold">Nome:</span> {outcome.ticket.holderName}
            </p>
          )}
          {outcome.ticket.seatLabel && (
            <p>
              <span className="font-semibold">Assento:</span> {outcome.ticket.seatLabel}
            </p>
          )}
          {outcome.ticket.eventTitle && (
            <p className="text-sm opacity-90">{outcome.ticket.eventTitle}</p>
          )}
        </div>
      )}

      {usedAtLabel && <p className="text-sm opacity-90">Entrada anterior: {usedAtLabel}</p>}

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onDismiss();
        }}
        className="mt-6 rounded-md border border-white/40 px-4 py-2 text-sm font-medium hover:bg-white/10"
      >
        Próxima leitura
      </button>
    </div>
  );
}
