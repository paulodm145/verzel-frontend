"use client";

import { useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

import { Volume2, VolumeX } from "lucide-react";

import { isApiError } from "@/lib/api-errors";
import { messages } from "@/lib/messages";

import { Button } from "@/components/ui/button";

import { useGateEvents } from "../hooks/useGateEvents";
import { usePersistedEventId } from "../hooks/usePersistedEventId";
import { useScanLock } from "../hooks/useScanLock";
import { useValidateTicket } from "../hooks/useValidateTicket";
import { playResultFeedback } from "../lib/feedback";
import { parseScannedValue } from "../lib/scanned-value";
import type { ScannedTicket } from "../lib/scanned-value";
import type { GateValidateResponse } from "../types";
import { EventPicker } from "./EventPicker";
import { ManualCodeInput } from "./ManualCodeInput";
import { QRScanner } from "./QRScanner";
import { ValidationResult } from "./ValidationResult";

/**
 * Tela da portaria. Orquestra câmera, entrada manual e o resultado em tela
 * cheia em torno de uma única `useScanLock`: câmera e envio manual
 * compartilham a mesma trava de 2s, porque os dois disparam a mesma
 * mutation e um envio manual durante o processamento de uma leitura de
 * câmera não pode empilhar uma segunda validação.
 */
export function CheckInScreen() {
  // A portaria pode chegar pela URL do QR (`/check-in?code=TKT-…`), lida pela
  // câmera nativa do celular em vez do leitor desta tela.
  const codeFromQr = useSearchParams().get("code") ?? undefined;
  const [eventId, setEventId] = usePersistedEventId();
  const { data: events } = useGateEvents();
  const [outcome, setOutcome] = useState<GateValidateResponse | null>(null);
  const [flowError, setFlowError] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const { mutateAsync } = useValidateTicket();
  const { locked, guard, unlock } = useScanLock();

  const runValidation = useCallback(
    (input: ScannedTicket) => {
      if (!eventId) {
        setFlowError("Selecione o evento desta porta antes de validar um ingresso.");
        return;
      }

      void guard(async () => {
        setFlowError(null);
        try {
          const result = await mutateAsync({ eventId, ...input });
          setOutcome(result);
          playResultFeedback(result.result, soundEnabled);
        } catch (error) {
          setOutcome(null);
          setFlowError(isApiError(error) ? error.message : messages.network.unexpected);
        }
      });
    },
    [eventId, guard, mutateAsync, soundEnabled],
  );

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <EventPicker value={eventId} onChange={setEventId} />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setSoundEnabled((current) => !current)}
          aria-label={soundEnabled ? "Desativar som de confirmação" : "Ativar som de confirmação"}
          aria-pressed={soundEnabled}
        >
          {soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
        </Button>
      </div>

      {events && events.length === 0 && (
        <p role="status" className="text-sm text-muted-foreground">
          Nenhum evento publicado no momento — a portaria libera entrada só para eventos publicados.
        </p>
      )}

      <div className="relative min-h-64 flex-1 overflow-hidden rounded-lg">
        <QRScanner
          active={!locked}
          onDetect={(scanned) => {
            // O QR carrega a URL pública; o parser extrai o código dela e ainda
            // aceita o token assinado dos ingressos emitidos antes disso.
            const input = parseScannedValue(scanned);
            if (input) runValidation(input);
          }}
          onReaderError={() => setFlowError(messages.checkin.readerUnavailable)}
        />
        {locked && outcome && <ValidationResult outcome={outcome} onDismiss={unlock} />}
      </div>

      {flowError && (
        <p
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          {flowError}
        </p>
      )}

      <ManualCodeInput
        disabled={locked}
        initialCode={codeFromQr}
        onSubmit={(code) => runValidation({ code })}
      />
    </div>
  );
}
