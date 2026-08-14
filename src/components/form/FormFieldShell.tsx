import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { Label } from "@/components/ui/label";

interface FormFieldShellProps {
  id: string;
  label: string;
  error?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Casca compartilhada por todos os campos de <Form>: label, o próprio
 * controle, e a linha de baixo (descrição OU erro — nunca as duas, senão
 * empilha ruído). Evita repetir este bloco em FormInput, FormSelect etc.
 */
export function FormFieldShell({
  id,
  label,
  error,
  description,
  children,
  className,
}: FormFieldShellProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : (
        description && <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
