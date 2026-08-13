"use client";

import { PanelLeft } from "lucide-react";

import type { ThemePreference } from "@/lib/theme";

import { Button } from "@/components/ui/button";
import { useUiStore } from "@/stores/ui-store";

import { ThemeToggle } from "./ThemeToggle";

export function Topbar({ title, theme }: { title: string; theme: ThemePreference }) {
  const toggleSidebar = useUiStore((state) => state.toggleSidebar);

  return (
    <header className="flex h-12 shrink-0 items-center gap-3 border-b border-border px-4">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} aria-label="Recolher menu">
        <PanelLeft className="h-4 w-4" />
      </Button>
      <h1 className="truncate text-sm font-semibold tracking-tight">{title}</h1>
      <div className="ml-auto">
        <ThemeToggle current={theme} />
      </div>
    </header>
  );
}
