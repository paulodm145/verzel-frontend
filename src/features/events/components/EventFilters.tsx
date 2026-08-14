"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EventFiltersProps {
  value: string;
  onChange: (value: string) => void;
}

/**
 * Campo controlado e "burro": propaga toda tecla imediatamente para o pai.
 * O debounce (300–500 ms) fica em `useDebouncedValue`, usado por quem chama
 * a query — separar as duas coisas evita que o campo pareça travado
 * enquanto digita.
 */
export function EventFilters({ value, onChange }: EventFiltersProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="event-search" className="sr-only">
        Buscar eventos
      </Label>
      <div className="relative max-w-sm">
        <Search
          className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id="event-search"
          type="search"
          placeholder="Buscar eventos..."
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-8"
        />
      </div>
    </div>
  );
}
