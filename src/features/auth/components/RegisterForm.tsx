"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Form } from "@/components/form/Form";
import { FormInput } from "@/components/form/FormInput";
import { FormPassword } from "@/components/form/FormPassword";
import { Button } from "@/components/ui/button";

import { useRegister } from "../hooks/useRegister";
import { registerSchema, type RegisterFormValues } from "../lib/auth-schemas";
import { safeNextPath } from "../lib/safe-next-path";
import { AuthFormError } from "./AuthFormError";

export function RegisterForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const register = useRegister();
  const [submitError, setSubmitError] = useState<unknown>();

  function handleSubmit(values: RegisterFormValues) {
    const input = { name: values.name, email: values.email, password: values.password };
    setSubmitError(undefined);
    register.mutate(input, {
      onSuccess: () => router.replace(safeNextPath(nextPath) ?? "/events"),
      onError: setSubmitError,
    });
  }

  return (
    <Form
      schema={registerSchema}
      onSubmit={handleSubmit}
      defaultValues={{ name: "", email: "", password: "", passwordConfirmation: "" }}
    >
      <AuthFormError error={submitError} />
      <FormInput name="name" label="Nome" autoComplete="name" />
      <FormInput name="email" label="E-mail" type="email" autoComplete="email" />
      <FormPassword name="password" label="Senha" autoComplete="new-password" />
      <FormPassword
        name="passwordConfirmation"
        label="Confirmar senha"
        autoComplete="new-password"
      />
      <Button type="submit" size="lg" disabled={register.isPending}>
        {register.isPending ? "Criando conta…" : "Criar conta"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link
          href={safeNextPath(nextPath) ? `/login?next=${encodeURIComponent(nextPath!)}` : "/login"}
          className="font-medium text-primary hover:underline"
        >
          Entrar
        </Link>
      </p>
    </Form>
  );
}
