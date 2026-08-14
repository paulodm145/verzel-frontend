import { AlertTriangle } from "lucide-react";

interface EventsErrorStateProps {
  message: string;
  requestId?: string;
}

/**
 * Tela de erro local ao epic (o kit genérico `AsyncBoundary` chega no epic
 * 02, em paralelo). Sempre mostra a `message` da API e o `requestId` em
 * letra miúda — é o que liga a reclamação ao log do backend
 * (07-performance.md item 11).
 */
export function EventsErrorState({ message, requestId }: EventsErrorStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center">
      <AlertTriangle className="h-6 w-6 text-destructive" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{message}</p>
      {requestId && <p className="text-xs text-muted-foreground">Código: {requestId}</p>}
    </div>
  );
}
