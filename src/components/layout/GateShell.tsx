"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";

import { LogOut, ScanLine } from "lucide-react";

import type { ThemePreference } from "@/lib/theme";

import { Button } from "@/components/ui/button";
import { useLogout } from "@/features/auth/hooks/useLogout";
import { useSession } from "@/features/auth/hooks/useSession";

import { ThemeToggle } from "./ThemeToggle";

export function GateShell({ children, theme }: { children: ReactNode; theme: ThemePreference }) {
  const router = useRouter();
  const { data: user } = useSession();
  const logout = useLogout();

  function handleLogout() {
    logout.mutate(undefined, { onSuccess: () => router.replace("/login") });
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border/70 bg-card px-4 sm:px-6">
        <span className="grid size-9 place-items-center rounded-lg bg-primary text-primary-foreground">
          <ScanLine className="size-5" aria-hidden="true" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">Verzel</p>
          <h1 className="text-sm font-semibold">Portaria</h1>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {user && (
            <span className="hidden max-w-40 truncate text-sm text-muted-foreground sm:inline">
              {user.name}
            </span>
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
      <main className="min-h-0 flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6">{children}</main>
    </div>
  );
}
