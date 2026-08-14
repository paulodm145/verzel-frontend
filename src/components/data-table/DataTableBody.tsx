"use client";

import type { ReactNode } from "react";

import type { Table } from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon } from "lucide-react";

import { ErrorState } from "@/components/feedback/ErrorState";
import { Skeleton } from "@/components/ui/skeleton";
import { TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface DataTableBodyProps<TData> {
  table: Table<TData>;
  columnCount: number;
  isLoading: boolean;
  error: unknown;
  isEmpty: boolean;
  emptyState: ReactNode;
  skeletonRowCount: number;
}

/** Cabeçalho + corpo da tabela, com os quatro estados: carregando, erro, vazio, populado. */
export function DataTableBody<TData>({
  table,
  columnCount,
  isLoading,
  error,
  isEmpty,
  emptyState,
  skeletonRowCount,
}: DataTableBodyProps<TData>) {
  return (
    <>
      <TableHeader>
        {table.getHeaderGroups().map((headerGroup) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => {
              const canSort = header.column.getCanSort();
              const sorted = header.column.getIsSorted();

              return (
                <TableHead key={header.id}>
                  {header.isPlaceholder ? null : canSort ? (
                    <button
                      type="button"
                      className="flex items-center gap-1 hover:text-foreground"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {sorted === "asc" && <ArrowUpIcon className="size-3.5" aria-hidden="true" />}
                      {sorted === "desc" && (
                        <ArrowDownIcon className="size-3.5" aria-hidden="true" />
                      )}
                      {!sorted && (
                        <ArrowUpDownIcon
                          className="size-3.5 text-muted-foreground/50"
                          aria-hidden="true"
                        />
                      )}
                    </button>
                  ) : (
                    flexRender(header.column.columnDef.header, header.getContext())
                  )}
                </TableHead>
              );
            })}
          </TableRow>
        ))}
      </TableHeader>
      <TableBody>
        {isLoading ? (
          // Linhas de esqueleto não têm identidade própria — a posição é a própria chave.
          Array.from({ length: skeletonRowCount }, (_, rowIndex) => (
            <TableRow key={`skeleton-row-${rowIndex}`}>
              {Array.from({ length: columnCount }, (_column, columnIndex) => (
                <TableCell key={`skeleton-cell-${columnIndex}`}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : error ? (
          <TableRow>
            <TableCell colSpan={columnCount} className="whitespace-normal p-0">
              <ErrorState error={error} className="rounded-none border-0" />
            </TableCell>
          </TableRow>
        ) : isEmpty ? (
          <TableRow>
            <TableCell colSpan={columnCount} className="whitespace-normal p-0">
              {emptyState}
            </TableCell>
          </TableRow>
        ) : (
          table.getRowModel().rows.map((row) => (
            <TableRow key={row.id}>
              {row.getVisibleCells().map((cell) => (
                <TableCell key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        )}
      </TableBody>
    </>
  );
}
