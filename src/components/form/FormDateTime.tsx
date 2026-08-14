"use client";

import { useId, type ChangeEvent } from "react";
import { useController, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { FormFieldShell } from "./FormFieldShell";

interface FormDateTimeProps {
  name: string;
  label: string;
  description?: string;
  min?: string;
}

/** ISO -> valor que <input type="datetime-local"> espera, em horário local. */
function toLocalInputValue(iso: unknown): string {
  if (typeof iso !== "string" || iso === "") return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";

  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Datetime local no input (o que o navegador exige), ISO 8601 UTC no valor
 * do formulário — é o formato que a API espera para `date`.
 */
export function FormDateTime({ name, label, description, min }: FormDateTimeProps) {
  const { control } = useFormContext();
  const id = useId();
  const { field, fieldState } = useController({ name, control });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    field.onChange(raw === "" ? undefined : new Date(raw).toISOString());
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
        type="datetime-local"
        min={min}
        aria-invalid={fieldState.invalid || undefined}
        {...field}
        value={toLocalInputValue(field.value)}
        onChange={handleChange}
      />
    </FormFieldShell>
  );
}
