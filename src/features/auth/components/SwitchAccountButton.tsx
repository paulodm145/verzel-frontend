"use client";

import { useRouter } from "next/navigation";

import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useLogout } from "../hooks/useLogout";
import { safeNextPath } from "../lib/safe-next-path";

/**
 * "Entre com uma conta que tenha acesso" precisa ser um botão, não um
 * conselho. Sem isso, quem bate no 403 tem de descobrir sozinho que primeiro
 * precisa sair — e o único botão de sair está na casca da área autenticada,
 * que é justamente a que acabou de ser negada.
 *
 * Encerra a sessão e vai ao login levando o destino pretendido, então depois
 * de entrar com o papel certo a pessoa cai onde queria estar.
 */
export function SwitchAccountButton({ nextPath }: { nextPath?: string }) {
  const router = useRouter();
  const logout = useLogout();
  const target = safeNextPath(nextPath);

  function handleSwitch() {
    logout.mutate(undefined, {
      onSuccess: () =>
        router.replace(target ? `/login?next=${encodeURIComponent(target)}` : "/login"),
    });
  }

  return (
    <Button onClick={handleSwitch} disabled={logout.isPending}>
      <LogIn className="size-4" aria-hidden="true" />
      {logout.isPending ? "Saindo…" : "Entrar com outra conta"}
    </Button>
  );
}
