"use client";

import { useEffect, useState } from "react";

import type { Table } from "@tanstack/react-table";
import { SettingsIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import type { DataTableToolbarConfig } from "./types";

const SEARCH_DEBOUNCE_MS = 400;

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  config: DataTableToolbarConfig;
}

/** Busca com debounce de 400 ms + menu de visibilidade de colunas. */
export function DataTableToolbar<TData>({ table, config }: DataTableToolbarProps<TData>) {
  const {
    search,
    searchPlaceholder = "Buscar…",
    searchValue,
    onSearchChange,
    columnVisibility,
  } = config;
  const [term, setTerm] = useState(searchValue ?? "");

  useEffect(() => {
    if (!onSearchChange) return;
    const timer = setTimeout(() => onSearchChange(term), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [term, onSearchChange]);

  if (!search && !columnVisibility) return null;

  const hideableColumns = table.getAllLeafColumns().filter((column) => column.getCanHide());

  return (
    <div className="flex items-center justify-between gap-2 pb-2">
      {search ? (
        <Input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Buscar"
          className="h-8 max-w-64"
        />
      ) : (
        <div />
      )}

      {columnVisibility && hideableColumns.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
            <SettingsIcon />
            Colunas
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Mostrar colunas</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {hideableColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column.id}
                checked={column.getIsVisible()}
                onCheckedChange={(checked) => column.toggleVisibility(checked)}
              >
                {column.columnDef.meta?.label ?? column.id}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
