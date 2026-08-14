"use client";

import { CalendarDays, MapPin, ShieldAlert } from "lucide-react";

import { isApiError } from "@/lib/api-errors";

import { Skeleton } from "@/components/ui/skeleton";

import { useTicketByCode } from "../hooks/useTicketByCode";
import { formatEventDate } from "../lib/format-event-date";
import { QRCodeDisplay } from "./QRCodeDisplay";

/**
 * Conteúdo de `/ticket/[code]`, a página pública de compartilhamento —
 * precisa funcionar sem sessão nenhuma (janela anônima). `useTicketByCode`
 * fala com `/api/tickets/:code` (passthrough público), não com o proxy
 * genérico `/api/v/*`, que exige cookie de sessão.
 */
export function TicketByCodeView({ code }: { code: string }) {
  const { data, isPending, isError, error } = useTicketByCode(code);

  if (isPending) {
    return (
      <div
        className="flex flex-col items-center gap-4"
        aria-busy="true"
        aria-label="Carregando ingresso"
      >
        <Skeleton className="h-[168px] w-[168px] rounded-md" />
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
      </div>
    );
  }

  if (isError) {
    return (
      <NotFound
        message={isApiError(error) ? error.message : "Não foi possível abrir este ingresso."}
        requestId={isApiError(error) ? error.requestId : undefined}
      />
    );
  }

  // `getByCode` resolve com `null` para código inexistente — 404 é estado
  // normal de "link errado", não uma exceção a propagar.
  if (!data) {
    return <NotFound message="Ingresso não encontrado. Confira se o link está completo." />;
  }

  const isUsed = data.status === "USED";

  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <QRCodeDisplay value={data.qrContent} />

      <div>
        <h1 className="text-lg font-semibold tracking-tight">{data.event.title}</h1>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
          {formatEventDate(data.event.date)}
        </p>
        <p className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
          {data.event.venue}
        </p>
      </div>

      <p className="text-sm">
        Assento <span className="font-semibold">{data.seatLabel}</span>
      </p>

      <p className="font-mono text-xl tracking-widest">{data.code}</p>

      <p
        className={
          isUsed
            ? "rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground"
            : "rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400"
        }
      >
        {isUsed ? "Ingresso já utilizado" : "Ingresso válido"}
      </p>
    </div>
  );
}

function NotFound({ message, requestId }: { message: string; requestId?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center text-muted-foreground">
      <ShieldAlert className="h-8 w-8" aria-hidden="true" />
      <p className="text-sm">{message}</p>
      {requestId && <p className="text-xs">Código: {requestId}</p>}
    </div>
  );
}
