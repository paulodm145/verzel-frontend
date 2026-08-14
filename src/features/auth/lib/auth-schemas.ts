import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("Informe um e-mail válido"),
  password: z.string().min(1, "Informe sua senha"),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Informe ao menos 2 caracteres").max(120),
    email: z.email("Informe um e-mail válido"),
    password: z.string().min(8, "Use ao menos 8 caracteres").max(128),
    passwordConfirmation: z.string().min(1, "Confirme sua senha"),
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    path: ["passwordConfirmation"],
    message: "As senhas não coincidem",
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
