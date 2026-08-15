import type { ReactNode } from "react";

import type { ThemePreference } from "@/lib/theme";

import { PublicFooter } from "./PublicFooter";
import { PublicHeader } from "./PublicHeader";

export function PublicShell({ children, theme }: { children: ReactNode; theme: ThemePreference }) {
  return (
    <div className="flex min-h-dvh flex-col bg-background text-foreground">
      <PublicHeader theme={theme} />
      <main className="mx-auto w-full max-w-[90rem] flex-1 px-4 py-5 sm:px-7 sm:py-7 lg:px-10">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
