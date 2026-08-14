"use client";

import { Calendar, LayoutDashboard, ScanLine, Ticket } from "lucide-react";

import { cn } from "@/lib/utils";

import { useUiStore } from "@/stores/ui-store";

// O epic 01 entrega a infraestrutura de sessão (BFF, middleware) mas ainda
// nenhuma tela de produto — as rotas abaixo existem no middleware.ts (para
// já protegê-las por papel), mas não têm page.tsx. Renderizar como <Link>
// resultaria num 404 clicável. Quando uma rota ganhar sua página real, ela
// sai desta lista de placeholders e vira um <Link> de verdade.
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
          <span
            key={href}
            aria-disabled="true"
            title={`${label} — esta tela ainda não existe, chega num epic futuro`}
            className="flex cursor-not-allowed items-center gap-2 rounded-md px-2 py-1.5 text-sm text-muted-foreground/50"
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            {/* sr-only mantém o nome acessível sempre que o rótulo visual some
                (abaixo de md, ou em md+ quando o store está recolhido) */}
            <span className={cn("truncate", collapsed ? "sr-only" : "sr-only md:not-sr-only")}>
              {label}
            </span>
          </span>
        ))}
      </nav>
    </aside>
  );
}
