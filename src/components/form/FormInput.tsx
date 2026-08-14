"use client";

import { useId, type ComponentProps } from "react";
import { useController, useFormContext } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { FormFieldShell } from "./FormFieldShell";

interface FormInputProps extends Omit<
  ComponentProps<typeof Input>,
  "id" | "name" | "value" | "onChange" | "onBlur"
> {
  name: string;
  label: string;
  description?: string;
}

export function FormInput({ name, label, description, ...inputProps }: FormInputProps) {
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
      <Input id={id} aria-invalid={fieldState.invalid || undefined} {...field} {...inputProps} />
    </FormFieldShell>
  );
}
