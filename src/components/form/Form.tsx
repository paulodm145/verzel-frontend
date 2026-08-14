"use client";

import type { ReactNode } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  FormProvider,
  useForm,
  useFormContext,
  useFormState,
  type DefaultValues,
  type SubmitHandler,
  type UseFormProps,
} from "react-hook-form";
import type { z } from "zod";

import { cn } from "@/lib/utils";

interface FormProps<TSchema extends z.ZodType> {
  schema: TSchema;
  onSubmit: SubmitHandler<z.infer<TSchema>>;
  defaultValues?: DefaultValues<z.infer<TSchema>>;
  children: ReactNode;
  className?: string;
  mode?: UseFormProps["mode"];
}

/**
 * Injeta o zodResolver e o contexto do react-hook-form. Os campos (FormInput
 * e companhia) leem esse contexto via useFormContext — nada de passar
 * `register`/`control` manualmente em cada tela.
 */
export function Form<TSchema extends z.ZodType>({
  schema,
  onSubmit,
  defaultValues,
  children,
  className,
  mode = "onBlur",
}: FormProps<TSchema>) {
  const form = useForm<z.infer<TSchema>>({
    resolver: zodResolver(schema),
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
