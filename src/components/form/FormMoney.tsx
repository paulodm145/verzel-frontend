"use client";

import { useId, useState, type ChangeEvent } from "react";

import { useController, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { FormFieldShell } from "./FormFieldShell";

interface FormMoneyProps {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

/** "1.234,56" (pt-BR) -> 1234.56. Devolve undefined quando não dá para converter. */
function parseBRL(raw: string): number | undefined {
  const cleaned = raw.replace(/[^\d,.-]/g, "");
  if (cleaned === "") return undefined;

  const normalized = cleaned.replace(/\./g, "").replace(",", ".");
  const value = Number(normalized);
  return Number.isNaN(value) ? undefined : value;
}

/**
 * Campo de dinheiro: mostra formatação BRL para o usuário, mas o valor que
 * vai para o formulário (e para a API) é sempre um número — `45.5`, nunca
 * `"R$ 45,50"`. A API não aceita string em `price`.
 */
export function FormMoney({ name, label, description, placeholder = "R$ 0,00" }: FormMoneyProps) {
  const { control } = useFormContext();
  const id = useId();
  const { field, fieldState } = useController({ name, control });
  const [display, setDisplay] = useState<string>(() =>
    typeof field.value === "number" ? currencyFormatter.format(field.value) : "",
  );

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    setDisplay(raw);
    field.onChange(parseBRL(raw));
  }

  function handleBlur() {
    field.onBlur();
    setDisplay(typeof field.value === "number" ? currencyFormatter.format(field.value) : "");
  }

  return (
    <FormFieldShell
      id={id}
      label={label}
      description={description}
      error={fieldState.error?.message}
    >
      <Input
        id={id}
        inputMode="decimal"
        placeholder={placeholder}
        name={field.name}
        ref={field.ref}
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        aria-invalid={fieldState.invalid || undefined}
      />
    </FormFieldShell>
  );
}
