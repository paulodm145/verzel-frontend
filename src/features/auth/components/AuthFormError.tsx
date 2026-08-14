"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";

import { isApiError } from "@/lib/api-errors";
import { messages } from "@/lib/messages";

import { FormRootError } from "@/components/form/Form";
import { useApiFormErrors } from "@/components/form/useApiFormErrors";

export function AuthFormError({ error }: { error: unknown }) {
  const form = useFormContext();
  const applyApiErrors = useApiFormErrors(form);

  useEffect(() => {
    if (!error) return;
    if (applyApiErrors(error)) return;

    form.setError("root", {
      type: "server",
      message: isApiError(error) ? error.message : messages.network.offline,
    });
  }, [applyApiErrors, error, form]);

  return <FormRootError />;
}
