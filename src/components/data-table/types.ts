import type { ReactNode } from "react";

import type { ColumnDef, SortingState } from "@tanstack/react-table";

// Amplia o meta padrão do TanStack: rótulo em português para o menu de
// visibilidade de colunas (o `header` pode ser JSX, não dá para usar direto).
declare module "@tanstack/table-core" {
  // Os dois generics são exigidos pela assinatura original da interface que
  // está sendo ampliada, mesmo sem uso no corpo.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData, TValue> {
    label?: string;
  }
}

export const MAX_TAKE = 50;

export interface DataTablePaginationState {
  skip: number;
  /** Máximo 50 — pedir mais responde 400 na API. */
  take: number;
  onChange: (next: { skip: number; take: number }) => void;
}

export interface DataTableSortingState {
  state: SortingState;
  onChange: (next: SortingState) => void;
}

export interface DataTableRowAction<TData> {
  label: string;
  href?: string;
  onClick?: (row: TData) => void;
  hidden?: boolean;
  variant?: "default" | "destructive";
}

export interface DataTableToolbarConfig {
  search?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  /** Chamado após o debounce (400 ms) — a busca em si é responsabilidade de quem consome. */
  onSearchChange?: (value: string) => void;
  columnVisibility?: boolean;
}

export interface DataTableProps<TData, TValue = unknown> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[] | undefined;
  totalCount?: number;
  pagination?: DataTablePaginationState;
  sorting?: DataTableSortingState;
  isLoading?: boolean;
  error?: unknown;
  emptyState?: ReactNode;
  toolbar?: DataTableToolbarConfig;
  rowActions?: (row: TData) => DataTableRowAction<TData>[];
  getRowId?: (row: TData, index: number) => string;
}
