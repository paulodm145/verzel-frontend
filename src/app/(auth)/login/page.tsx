import { AuthPanel } from "@/features/auth/components/AuthPanel";
import { LoginForm } from "@/features/auth/components/LoginForm";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { next } = await searchParams;

  return (
    <AuthPanel title="Acesse sua conta" description="Entre para continuar na plataforma.">
      <LoginForm nextPath={typeof next === "string" ? next : undefined} />
    </AuthPanel>
  );
}
