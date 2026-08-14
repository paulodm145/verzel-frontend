"use client";

import { useState, type FormEvent } from "react";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { formatTicketCode, isCompleteTicketCode } from "../lib/ticket-code-format";

interface ManualCodeInputProps {
  disabled?: boolean;
  onSubmit: (code: string) => void;
}

/**
 * Sempre visível — nunca atrás de um "câmera não funciona?". Câmera negada,
 * QR riscado ou bateria fraca no celular do cliente não podem ser um beco
 * sem saída com fila esperando na porta (spec 000, 4.4).
 */
export function ManualCodeInput({ disabled, onSubmit }: ManualCodeInputProps) {
  const [value, setValue] = useState("");
  const complete = isCompleteTicketCode(value);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!complete || disabled) return;
    onSubmit(value);
    setValue("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
      <Label htmlFor="manual-ticket-code">Código do ingresso</Label>
      <div className="flex gap-2">
        <Input
          id="manual-ticket-code"
          value={value}
          onChange={(event) => setValue(formatTicketCode(event.target.value))}
          placeholder="TKT-XXXX-XXXX-XXXX"
          autoFocus
          disabled={disabled}
          autoComplete="off"
          spellCheck={false}
          className="font-mono tracking-wide uppercase"
          aria-describedby="manual-ticket-code-hint"
        />
        <Button type="submit" disabled={disabled || !complete} aria-label="Validar código digitado">
          <Send aria-hidden="true" />
        </Button>
      </div>
      <p id="manual-ticket-code-hint" className="text-xs text-muted-foreground">
        Câmera não lê? Digite o código impresso ou mostrado na tela do ingresso e aperte Enter.
      </p>
    </form>
  );
}
