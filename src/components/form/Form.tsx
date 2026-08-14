"use client";

import type { ReactNode } from "react";
import {
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { cn } from "@/lib/utils";

// TFieldValues é inferido do `schema` (z.ZodType<TFieldValues>) no call site —
// generic sobre o schema (em vez de `TSchema extends z.ZodType`) mantém
// `useForm` e `zodResolver` alinhados sem instanciar `unknown` no meio.
interface FormProps<TFieldValues extends FieldValues> {
  schema: z.ZodType<TFieldValues>;
  onSubmit: SubmitHandler<TFieldValues>;
  defaultValues?: DefaultValues<TFieldValues>;
  children: ReactNode;
  className?: string;
  mode?: UseFormProps["mode"];
}

/**
 * Injeta o zodResolver e o contexto do react-hook-form. Os campos (FormInput
 * e companhia) leem esse contexto via useFormContext — nada de passar
 * `register`/`control` manualmente em cada tela.
 */
export function Form<TFieldValues extends FieldValues>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className,
  mode = "onBlur",
}: FormProps<TFieldValues>) {
  const form = useForm<TFieldValues>({
    // O overload do zodResolver para Zod 4 espera um schema com input "unknown"
    // (dado bruto do formulário); um z.ZodType<TFieldValues> genérico não bate
    // com esse shape na inferência do TS, embora seja exatamente o que o
    // resolver faz em runtime. `schema` já está tipado na prop — os casts só
    // contornam a fricção de generics entre as duas bibliotecas.
    resolver: zodResolver(schema as never) as unknown as Resolver<TFieldValues>,
    defaultValues,
    mode,
  });

  return (
    <FormProvider {...form}>
      <form
        noValidate
        className={cn("flex flex-col gap-4", className)}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        {children}
      </form>
    </FormProvider>
  );
}

/**
 * Erro geral do formulário: onde caem "(corpo)" e paths sem campo
 * correspondente (ver useApiFormErrors) — nunca somem em silêncio. Cada tela
 * decide onde encaixar (normalmente logo abaixo do título do formulário).
 */
export function FormRootError({ className }: { className?: string }) {
  const { control } = useFormContext();
  const { errors } = useFormState({ control, name: "root" });

  if (!errors.root?.message) return null;

  return (
    <p
      role="alert"
      className={cn(
        "rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive",
        className,
      )}
    >
      {errors.root.message}
    </p>
  );
}
