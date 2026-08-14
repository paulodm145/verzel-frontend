"use client";

import { useEffect, useRef, useState } from "react";

import { ClockIcon } from "lucide-react";

import { cn } from "@/lib/utils";

const TICK_MS = 1000;
/** Últimos 60s: troca para tom de atenção, sem piscar nem alarme sonoro —
 * a reserva ainda é o único sinal, não precisa assustar. */
const URGENT_THRESHOLD_MS = 60_000;

function formatRemaining(ms: number): string {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

interface ReservationCountdownProps {
  /** ISO 8601 — `expiresAt` da reserva. */
  expiresAt: string;
  /** Chamado uma única vez, no instante em que o contador chega a zero. */
  onExpire?: () => void;
  className?: string;
}

/**
 * Único sinal de que o assento reservado está escorrendo (10 minutos,
 * `04-reserva-e-pagamento.md`). Calmo por padrão: texto simples, sem
 * animação; some da tela sozinho ao expirar em vez de deixar um "0:00"
 * morto, porque a partir daí não existe mais nada a contar — a reserva já
 * era, e tentar pagar responde 409.
 */
export function ReservationCountdown({
  expiresAt,
  onExpire,
  className,
}: ReservationCountdownProps) {
  const notifiedRef = useRef(false);
  const [remaining, setRemaining] = useState(() => new Date(expiresAt).getTime() - Date.now());

  useEffect(() => {
    // Não resincroniza `remaining` de forma síncrona aqui (dispararia um
    // segundo render em cascata) — o valor inicial já vem certo do
    // `useState` acima; a partir daqui só o `setInterval` atualiza o estado,
    // como assinatura de um relógio externo.
    const target = new Date(expiresAt).getTime();
    notifiedRef.current = false;

    const interval = setInterval(() => {
      setRemaining(target - Date.now());
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [expiresAt]);

  useEffect(() => {
    if (remaining <= 0 && !notifiedRef.current) {
      notifiedRef.current = true;
      onExpire?.();
    }
  }, [remaining, onExpire]);

  if (remaining <= 0) return null;

  const isUrgent = remaining <= URGENT_THRESHOLD_MS;

  return (
    <p
      role="timer"
      aria-live="polite"
      className={cn(
        "flex items-center gap-1.5 text-sm",
        isUrgent ? "font-medium text-destructive" : "text-muted-foreground",
        className,
      )}
    >
      <ClockIcon className="size-4 shrink-0" aria-hidden="true" />
      Reserva expira em <span className="font-mono tabular-nums">{formatRemaining(remaining)}</span>
    </p>
  );
}
