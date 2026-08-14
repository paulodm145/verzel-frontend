import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { EmptyState } from "./EmptyState";
import { ErrorState } from "./ErrorState";

interface AsyncBoundaryProps {
  isLoading: boolean;
  error?: unknown;
  isEmpty?: boolean;
  onRetry?: () => void;
  loadingFallback?: ReactNode;
  emptyState?: ReactNode;
  children: ReactNode;
}

/** Skeleton genérico de página — usado quando a tela não passa `loadingFallback` próprio. */
function DefaultLoadingFallback() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

/**
 * Padroniza carregando/erro/vazio/populado nas telas, para não haver três
 * desenhos diferentes de "deu erro" pelo app. Erro sempre mostra a `message`
 * da API e o `requestId` (via ErrorState).
 */
export function AsyncBoundary({
  isLoading,
  error,
  isEmpty = false,
  onRetry,
  loadingFallback,
  emptyState,
  children,
}: AsyncBoundaryProps) {
  if (isLoading) return <>{loadingFallback ?? <DefaultLoadingFallback />}</>;
  if (error) return <ErrorState error={error} onRetry={onRetry} />;
  if (isEmpty) {
    return <>{emptyState ?? <EmptyState title="Nada para mostrar aqui ainda." />}</>;
  }

  return <>{children}</>;
}
