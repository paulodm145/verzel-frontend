"use client";

import { useId } from "react";
import { useController, useFormContext } from "react-hook-form";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { FormFieldShell } from "./FormFieldShell";

export interface FormSelectOption {
  value: string;
  label: string;
}

interface FormSelectProps {
  name: string;
  label: string;
  options: FormSelectOption[];
  placeholder?: string;
  description?: string;
}

export function FormSelect({
  name,
  label,
  options,
  placeholder = "Selecione",
  description,
}: FormSelectProps) {
  const { control } = useFormContext();
  const id = useId();
  const { field, fieldState } = useController({ name, control });

  return (
    <FormFieldShell
      id={id}
      label={label}
      description={description}
      error={fieldState.error?.message}
    >
      <Select
        value={(field.value as string | undefined) ?? ""}
        onValueChange={field.onChange}
        name={field.name}
      >
        <SelectTrigger id={id} aria-invalid={fieldState.invalid || undefined} className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FormFieldShell>
  );
}
