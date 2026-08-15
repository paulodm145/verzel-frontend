"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Form } from "@/components/form/Form";
import { FormInput } from "@/components/form/FormInput";
import { FormPassword } from "@/components/form/FormPassword";
import { Button } from "@/components/ui/button";

import { useLogin } from "../hooks/useLogin";
import { loginSchema, type LoginFormValues } from "../lib/auth-schemas";
import { safeNextPath } from "../lib/safe-next-path";
import type { Role } from "../types";
import { AuthFormError } from "./AuthFormError";

const HOME_BY_ROLE: Record<Role, string> = {
  CUSTOMER: "/events",
  ORGANIZER: "/dashboard",
  GATE: "/check-in",
};

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const login = useLogin();
  const [submitError, setSubmitError] = useState<unknown>();

  function handleSubmit(values: LoginFormValues) {
    setSubmitError(undefined);
    login.mutate(values, {
      onSuccess: ({ user }) =>
        router.replace(
          user.role === "CUSTOMER"
            ? (safeNextPath(nextPath) ?? HOME_BY_ROLE.CUSTOMER)
            : HOME_BY_ROLE[user.role],
        ),
      onError: setSubmitError,
    });
  }

  return (
    <Form schema={loginSchema} onSubmit={handleSubmit} defaultValues={{ email: "", password: "" }}>
      <AuthFormError error={submitError} />
      <FormInput name="email" label="E-mail" type="email" autoComplete="email" />
      <FormPassword name="password" label="Senha" autoComplete="current-password" />
      <Button type="submit" size="lg" disabled={login.isPending}>
        {login.isPending ? "Entrando…" : "Entrar"}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        Ainda não tem conta?{" "}
        <Link
          href={
            safeNextPath(nextPath) ? `/register?next=${encodeURIComponent(nextPath!)}` : "/register"
          }
          className="font-medium text-primary hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </Form>
  );
}
