"use client";

import Link from "next/link";
import { useMemo } from "react";

import {
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
  type RowData,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";

import { EmptyState } from "@/components/feedback/EmptyState";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";

import { DataTableBody } from "./DataTableBody";
import { DataTablePagination } from "./DataTablePagination";
import { DataTableToolbar } from "./DataTableToolbar";
import type { DataTableProps, DataTableRowAction } from "./types";

const DEFAULT_SKELETON_ROWS = 8;

function actionsColumn<TData extends RowData>(
  rowActions: (row: TData) => DataTableRowAction<TData>[],
): ColumnDef<TData> {
  return {
    id: "__actions",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const actions = rowActions(row.original).filter((action) => !action.hidden);
      if (actions.length === 0) return null;

      return (
        <div className="flex items-center justify-end gap-1">
          {actions.map((action) =>
            action.href ? (
              <Button
                key={action.label}
                nativeButton={false}
                variant="ghost"
                size="sm"
                render={<Link href={action.href} />}
              >
                {action.label}
              </Button>
            ) : (
              <Button
                key={action.label}
                variant={action.variant === "destructive" ? "destructive" : "ghost"}
                size="sm"
                onClick={() => action.onClick?.(row.original)}
              >
                {action.label}
              </Button>
            ),
          )}
        </div>
      );
    },
  };
}

/**
 * Wrapper genérico sobre TanStack Table: colunas declarativas, ordenação e
 * paginação server-side, busca com debounce, visibilidade de colunas, ações
 * inline por linha, e os quatro estados visuais. Densidade AdminLTE — não
 * seleção em lote, agrupamento, master-detail, resize/reorder ou export
 * (sem consumidor no desafio, YAGNI deliberado).
 */
export function DataTable<TData, TValue = unknown>({
  columns,
  data,
  totalCount,
  pagination,
  sorting,
  isLoading = false,
  error,
  emptyState,
  toolbar,
  rowActions,
  getRowId,
}: DataTableProps<TData, TValue>) {
  const resolvedColumns = useMemo<ColumnDef<TData, TValue>[]>(
    () => (rowActions ? [...columns, actionsColumn(rowActions)] : columns),
    [columns, rowActions],
  );

  const rows = data ?? [];

  const table = useReactTable({
    data: rows,
    columns: resolvedColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId,
    manualSorting: true,
    manualPagination: true,
    state: {
      sorting: sorting?.state ?? [],
    },
    onSortingChange: (updater) => {
      if (!sorting) return;
      const next = typeof updater === "function" ? updater(sorting.state) : updater;
      sorting.onChange(next);
    },
  });

  const isEmpty = !isLoading && !error && rows.length === 0;

  return (
    // Card com header, corpo e footer demarcados — o padrão de card do
    // AdminLTE. Antes a toolbar e a paginação flutuavam soltas fora da borda,
    // sem indicar que pertenciam à tabela.
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-border bg-card",
        isEmpty && "border-dashed",
      )}
    >
      {toolbar && (
        <div className="border-b border-border/60 bg-muted/40 px-2 py-2">
          <DataTableToolbar table={table} config={toolbar} />
        </div>
      )}

      {/*
        A altura máxima é o que torna o cabeçalho fixo possível: `sticky` só
        gruda em relação a um contêiner que realmente rola. Sem ela o thead
        sairia de vista assim que a página rolasse.
      */}
      <div className="max-h-[calc(100dvh-18rem)] min-h-32 overflow-auto">
        <Table>
          <DataTableBody
            table={table}
            columnCount={resolvedColumns.length}
            isLoading={isLoading}
            error={error}
            isEmpty={isEmpty}
            emptyState={emptyState ?? <EmptyState title="Nenhum registro encontrado." />}
            skeletonRowCount={pagination?.take ?? DEFAULT_SKELETON_ROWS}
          />
        </Table>
      </div>

      {pagination && !isLoading && !error && (
        <div className="border-t border-border/60 bg-muted/40 px-2 py-2">
          <DataTablePagination
            pagination={pagination}
            totalCount={totalCount}
            currentRowCount={rows.length}
          />
        </div>
      )}
    </div>
  );
}
