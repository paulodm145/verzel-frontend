"use client";

import Link from "next/link";

import { Calendar, LayoutDashboard, ScanLine, Ticket } from "lucide-react";

import { cn } from "@/lib/utils";

import { useUiStore } from "@/stores/ui-store";

// Placeholder de navegação: os itens reais dependem do papel do usuário
// (CUSTOMER/ORGANIZER/GATE) e chegam no epic 01. Os destinos abaixo já
// refletem a estrutura de rotas documentada no CLAUDE.md, sem simular
// dados de usuário (avatar, badges) que ainda não existem.
const NAV_ITEMS = [
  { href: "/events", label: "Eventos", icon: Calendar },
  { href: "/my-tickets", label: "Meus ingressos", icon: Ticket },
  { href: "/dashboard", label: "Painel do organizador", icon: LayoutDashboard },
  { href: "/check-in", label: "Portaria", icon: ScanLine },
] as const;

export function Sidebar() {
  const collapsed = useUiStore((state) => state.sidebarCollapsed);

  return (
    // Abaixo de md a sidebar é sempre ícone-only, independente do store — só
    // a partir de md o estado de sidebarCollapsed passa a valer. Resolvido em
    // CSS puro (classes responsivas w-14 md:w-56), sem matchMedia/useEffect,
    // para não reintroduzir o flash de hidratação que o tema já evitou.
    <aside
      className={cn(
        "flex shrink-0 flex-col border-r border-border transition-[width] duration-150",
        collapsed ? "w-14 md:w-14" : "w-14 md:w-56",
      )}
    >
      <nav aria-label="Navegação principal" className="flex flex-col gap-0.5 p-2">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {/* sr-only mantém o nome acessível sempre que o rótulo visual some
                (abaixo de md, ou em md+ quando o store está recolhido) */}
            <span className={cn("truncate", collapsed ? "sr-only" : "sr-only md:not-sr-only")}>
              {label}
            </span>
          </Link>
        ))}
      </nav>
    </aside>
  );
}
