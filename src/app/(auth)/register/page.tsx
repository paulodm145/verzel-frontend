import { AuthPanel } from "@/features/auth/components/AuthPanel";
import { RegisterForm } from "@/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <AuthPanel
      title="Crie sua conta"
      description="Cadastre-se como cliente para reservar ingressos."
    >
      <RegisterForm />
    </AuthPanel>
  );
}
