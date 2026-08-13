"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { setTheme } from "@/app/theme-action";
import { Monitor, Moon, Sun } from "lucide-react";

import type { ThemePreference } from "@/lib/theme";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const OPTIONS: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: "light", label: "Claro", Icon: Sun },
  { value: "dark", label: "Escuro", Icon: Moon },
  { value: "system", label: "Sistema", Icon: Monitor },
];

export function ThemeToggle({ current }: { current: ThemePreference }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function choose(theme: ThemePreference) {
    startTransition(async () => {
      await setTheme(theme);
      // O atributo data-theme é renderizado no servidor; refresh o repinta.
      router.refresh();
    });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" disabled={pending} aria-label="Alternar tema" />
        }
      >
        <Sun className="h-4 w-4 dark:hidden" />
        <Moon className="hidden h-4 w-4 dark:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {OPTIONS.map(({ value, label, Icon }) => (
          <DropdownMenuItem
            key={value}
            onSelect={() => choose(value)}
            aria-current={current === value}
          >
            <Icon className="mr-2 h-4 w-4" />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
