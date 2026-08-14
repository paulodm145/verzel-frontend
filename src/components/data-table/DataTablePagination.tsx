"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { DataTablePaginationState } from "./types";

interface DataTablePaginationProps {
  pagination: DataTablePaginationState;
  totalCount: number | undefined;
  currentRowCount: number;
}

/** Paginação server-side em skip/take — nada de "página X de Y" calculado sobre dado parcial. */
export function DataTablePagination({
  pagination,
  totalCount,
  currentRowCount,
}: DataTablePaginationProps) {
  const { skip, take, onChange } = pagination;
  const from = totalCount === 0 ? 0 : skip + 1;
  const to = skip + currentRowCount;
  const hasPrevious = skip > 0;
  const hasNext = totalCount !== undefined ? skip + take < totalCount : currentRowCount === take;

  return (
    <div className="flex items-center justify-between gap-2 border-t border-border pt-2 text-sm text-muted-foreground">
      <span>
        {totalCount !== undefined
          ? `Mostrando ${from}–${to} de ${totalCount}`
          : `Mostrando ${from}–${to}`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          disabled={!hasPrevious}
          onClick={() => onChange({ skip: Math.max(0, skip - take), take })}
          aria-label="Página anterior"
        >
          <ChevronLeftIcon />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          disabled={!hasNext}
          onClick={() => onChange({ skip: skip + take, take })}
          aria-label="Próxima página"
        >
          <ChevronRightIcon />
        </Button>
      </div>
    </div>
  );
}
