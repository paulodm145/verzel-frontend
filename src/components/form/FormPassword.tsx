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
          // Reserva a largura do botão (size-7) mais folga real dos dois lados.
          className="pr-10"
          {...field}
        />
        {/*
          Centralização por `inset-y-0 my-auto`, NÃO por `-translate-y-1/2`:
          `buttonVariants` já aplica `active:translate-y-px` e, no Tailwind v4,
          os dois escreveriam a mesma `--tw-translate-y`. No `:active` a
          centralização era descartada, o botão saltava meia altura para baixo
          e escapava de sob o cursor entre `mousedown` e `mouseup` — o `click`
          nem chegava a disparar, e a senha ora aparecia, ora não.
        */}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute inset-y-0 right-1 my-auto"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          aria-pressed={visible}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </Button>
      </div>
    </FormFieldShell>
  );
}
