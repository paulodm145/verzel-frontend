"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { LogOut, Ticket } from "lucide-react";

import type { ThemePreference } from "@/lib/theme";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSession } from "@/features/auth/hooks/useSession";

import { ThemeToggle } from "./ThemeToggle";

const AREA_BY_ROLE = {
  CUSTOMER: "/my-tickets",
  ORGANIZER: "/dashboard",
  GATE: "/check-in",
} as const;

export function PublicHeader({ theme }: { theme: ThemePreference }) {
  const router = useRouter();
  const { data: user, isLoading } = useSession();
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => router.replace("/") });
  }

  return (
    <header className="sticky top-0 z-30 bg-background/90 shadow-[0_1px_0_color-mix(in_oklch,var(--foreground)_8%,transparent)] backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[90rem] items-center gap-4 px-4 sm:px-7 lg:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-bold tracking-[-0.03em] text-foreground"
        >
          <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Ticket className="size-5" aria-hidden="true" />
          </span>
          <span>VERZEL</span>
        </Link>
        <nav aria-label="Navegação pública" className="ml-2 hidden sm:flex">
          <Link
            href="/events"
            className="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Eventos
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle current={theme} />
          {!isLoading && !user && (
            <>
              <Button nativeButton={false} variant="ghost" render={<Link href="/login" />}>
                Entrar
              </Button>
              <Button
                nativeButton={false}
                className="hidden sm:inline-flex"
                render={<Link href="/register" />}
              >
                Criar conta
              </Button>
            </>
          )}
          {user && (
            <>
              <span className="hidden max-w-40 truncate text-sm text-muted-foreground md:inline">
                {user.name}
              </span>
              <Button
                nativeButton={false}
                variant="outline"
                render={<Link href={AREA_BY_ROLE[user.role]} />}
              >
                {user.role === "CUSTOMER" ? "Meus ingressos" : "Minha área"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                disabled={logout.isPending}
                aria-label="Sair da conta"
              >
                <LogOut className="size-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
