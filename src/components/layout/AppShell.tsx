import type { ReactNode } from "react";

import type { ThemePreference } from "@/lib/theme";

import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  children: ReactNode;
  title: string;
  theme: ThemePreference;
}

export function AppShell({ children, title, theme }: AppShellProps) {
  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={title} theme={theme} />
        <main className="min-h-0 flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}
