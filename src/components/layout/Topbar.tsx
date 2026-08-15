"use client";

import { useRouter } from "next/navigation";

import { LogOut, PanelLeft } from "lucide-react";

import type { ThemePreference } from "@/lib/theme";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSession } from "@/features/auth/hooks/useSession";
import { useUiStore } from "@/stores/ui-store";

import { ThemeToggle } from "./ThemeToggle";

export function Topbar({ title, theme }: { title: string; theme: ThemePreference }) {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);
  const { data: user } = useSession();
  const logout = useLogout();
  const router = useRouter();

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => router.replace("/login") });
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-card px-4 sm:px-6">
      {/* Abaixo de md a sidebar é sempre ícone-only (CSS puro), então o
          botão não tem efeito nenhum ali — escondido para não sobrar um
          controle que não faz nada. */}
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleSidebar}
        aria-label="Recolher menu"
        className="hidden sm:inline-flex"
      >
        <PanelLeft className="h-4 w-4" />
      </Button>
      {/* Um passo acima do text-sm do resto da casca: hierarquia real por
          peso E tamanho, não só cor (ver CLAUDE.md — critério anti-AI-slop). */}
      <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
      <div className="ml-auto flex items-center gap-2">
        {user && (
          <span className="hidden text-sm text-muted-foreground md:inline">{user.name}</span>
        )}
        <ThemeToggle current={theme} />
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          disabled={logout.isPending}
          aria-label="Sair da conta"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  );
}
