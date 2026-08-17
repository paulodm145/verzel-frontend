import { cookies } from "next/headers";
import Link from "next/link";

import { ShieldAlertIcon } from "lucide-react";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { SwitchAccountButton } from "@/features/auth/components/SwitchAccountButton";

/**
 * Papel insuficiente — não é redirecionamento de login (`middleware.ts` só
 * chega aqui quando a sessão É válida, mas o papel não dá acesso à rota).
 * Por isso o texto fala em permissão, nunca em "faça login novamente".
 */
export default async function ForbiddenPage({ searchParams }: PageProps<"/403">) {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);
  const { next } = await searchParams;
  const nextPath = typeof next === "string" ? next : undefined;

  return (
    <AppShell title="Acesso negado" theme={theme}>
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <ShieldAlertIcon className="size-10 text-destructive" aria-hidden="true" />
        <h2 className="text-lg font-semibold">Você não tem permissão para acessar esta área</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Sua sessão continua válida, mas este espaço é restrito a outro papel de usuário. Volte
          para o início ou entre com uma conta que tenha acesso.
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          <SwitchAccountButton nextPath={nextPath} />
          <Button nativeButton={false} variant="outline" render={<Link href="/" />}>
            Voltar ao início
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
