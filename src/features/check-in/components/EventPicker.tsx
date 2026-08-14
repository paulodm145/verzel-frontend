"use client";

import { useGateEvents } from "../hooks/useGateEvents";

interface EventPickerProps {
  value: string;
  onChange: (id: string) => void;
}

/**
 * Seletor do evento desta porta. `POST /gate/validate` exige `eventId` no
 * corpo — é o que permite distinguir `WRONG_EVENT` de `INVALID` — então a
 * tela precisa saber para qual evento está validando antes de ler qualquer
 * QR. `<select>` nativo em vez do `FormSelect` do kit (epic 02): esta tela
 * não usa React Hook Form, é um controle solto de configuração da sessão de
 * portaria, não um campo de formulário submetido à API.
 */
export function EventPicker({ value, onChange }: EventPickerProps) {
  const { data: events, isLoading, isError } = useGateEvents();

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="gate-event" className="text-sm font-medium text-muted-foreground">
        Evento desta porta
      </label>
      <select
        id="gate-event"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={isLoading}
        className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
      >
        <option value="">{isLoading ? "Carregando…" : "Selecione…"}</option>
        {events?.map((event) => (
          <option key={event.id} value={event.id}>
            {event.title} — {event.venue}
          </option>
        ))}
      </select>
      {isError && (
        <span className="text-xs text-destructive">Não foi possível carregar os eventos.</span>
      )}
    </div>
  );
}
