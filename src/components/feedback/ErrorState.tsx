import { AlertTriangleIcon } from "lucide-react";

import { isApiError } from "@/lib/api-errors";
import { messages } from "@/lib/messages";

import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

/**
 * Tela/bloco de erro padrão: mostra a `message` da API (já em português,
 * escrita para o usuário final) e o `requestId` em letra miúda — é o que
 * liga a reclamação ao log do backend. Erro que não é da API (rede, timeout)
 * cai no fallback de `lib/messages.ts`.
 */
export function ErrorState({ error, onRetry, className }: ErrorStateProps) {
  const message = isApiError(error) ? error.message : messages.network.unexpected;
  const requestId = isApiError(error) ? error.requestId : undefined;

  return (
    <div
      role="alert"
      className={`flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-8 text-center ${className ?? ""}`}
    >
      <AlertTriangleIcon className="size-8 text-destructive" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{message}</p>
      {requestId && (
        <p className="text-xs text-muted-foreground">
          Código para suporte: <span className="font-mono">{requestId}</span>
        </p>
      )}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Tentar de novo
        </Button>
      )}
    </div>
  );
}
