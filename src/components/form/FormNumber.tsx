"use client";

import { useId, type ChangeEvent } from "react";

import { useController, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { FormFieldShell } from "./FormFieldShell";

interface FormNumberProps {
  name: string;
  label: string;
  description?: string;
  min?: number;
  max?: number;
  step?: number;
}

/** Número puro — sem casas decimais fixas nem prefixo de moeda (ver FormMoney). */
export function FormNumber({ name, label, description, min, max, step }: FormNumberProps) {
  const { control } = useFormContext();
  const id = useId();
  const { field, fieldState } = useController({ name, control });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const raw = event.target.value;
    field.onChange(raw === "" ? undefined : Number(raw));
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
        type="number"
        min={min}
        max={max}
        step={step}
        name={field.name}
        ref={field.ref}
        value={(field.value as number | undefined) ?? ""}
        onChange={handleChange}
        onBlur={field.onBlur}
        aria-invalid={fieldState.invalid || undefined}
      />
    </FormFieldShell>
  );
}
