"use client";

import { useId, type ComponentProps } from "react";
import { useController, useFormContext } from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";

import { FormFieldShell } from "./FormFieldShell";

interface FormTextareaProps extends Omit<
  ComponentProps<typeof Textarea>,
  "id" | "name" | "value" | "onChange" | "onBlur"
> {
  name: string;
  label: string;
  description?: string;
}

export function FormTextarea({ name, label, description, ...textareaProps }: FormTextareaProps) {
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
      <Textarea
        id={id}
        aria-invalid={fieldState.invalid || undefined}
        {...field}
        {...textareaProps}
      />
    </FormFieldShell>
  );
}
