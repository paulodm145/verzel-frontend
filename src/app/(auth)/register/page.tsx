import { AuthPanel } from "@/features/auth/components/AuthPanel";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default async function RegisterPage({ searchParams }: PageProps<"/register">) {
  const { next } = await searchParams;

  return (
    <AuthPanel
      title="Crie sua conta"
      description="Cadastre-se como cliente para reservar ingressos."
    >
      <RegisterForm nextPath={typeof next === "string" ? next : undefined} />
    </AuthPanel>
  );
}
