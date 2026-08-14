"use client";

import { useId, useState, type ComponentProps } from "react";
import { useController, useFormContext } from "react-hook-form";

import { EyeIcon, EyeOffIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { FormFieldShell } from "./FormFieldShell";

interface FormPasswordProps {
  name: string;
  label: string;
  description?: string;
  autoComplete?: ComponentProps<"input">["autoComplete"];
}

export function FormPassword({ name, label, description, autoComplete }: FormPasswordProps) {
  const { control } = useFormContext();
  const id = useId();
  const [visible, setVisible] = useState(false);
  const { field, fieldState } = useController({ name, control });

  return (
    <FormFieldShell
      id={id}
      label={label}
      description={description}
      error={fieldState.error?.message}
    >
      <div className="relative">
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          aria-invalid={fieldState.invalid || undefined}
          className="pr-8"
          {...field}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-1/2 right-1 -translate-y-1/2"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      </div>
    </FormFieldShell>
  );
}
