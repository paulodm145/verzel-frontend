"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface EventsPaginationProps {
  skip: number;
  take: number;
  total: number;
  onSkipChange: (skip: number) => void;
}

/**
 * Paginação simples sobre skip/take (não página/tamanho): "anterior/próxima"
 * cobre o caso real de uma listagem pública sem precisar de números de
 * página, que fariam sentido no `DataTable` do dashboard do organizador, não
 * aqui.
 */
export function EventsPagination({ skip, take, total, onSkipChange }: EventsPaginationProps) {
  if (total === 0) return null;

  const from = skip + 1;
  const to = Math.min(skip + take, total);
  const hasPrevious = skip > 0;
  const hasNext = to < total;

  return (
    <div className="flex items-center justify-between border-t border-border pt-3">
      <p className="text-xs text-muted-foreground">
        {from}–{to} de {total}
      </p>
      <div className="flex items-center gap-1.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasPrevious}
          onClick={() => onSkipChange(Math.max(0, skip - take))}
        >
          <ChevronLeft aria-hidden="true" />
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!hasNext}
          onClick={() => onSkipChange(skip + take)}
        >
          Próxima
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
