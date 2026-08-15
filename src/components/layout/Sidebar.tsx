"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { Calendar, LayoutDashboard, PlusCircle, ScanLine, Ticket } from "lucide-react";

import { cn } from "@/lib/utils";

import { useSession } from "@/features/auth/hooks/useSession";
import type { Role } from "@/features/auth/types";
import { useUiStore } from "@/stores/ui-store";

interface NavItem {
  href: string;
  label: string;
  icon: typeof Calendar;
  /** Agrupa itens sob um rótulo; itens sem grupo abrem a lista. */
  group?: string;
}

const NAV_BY_ROLE: Record<Role, ReadonlyArray<NavItem>> = {
  CUSTOMER: [
    { href: "/events", label: "Explorar eventos", icon: Calendar },
    { href: "/my-tickets", label: "Meus ingressos", icon: Ticket },
  ],
  ORGANIZER: [
    { href: "/dashboard", label: "Meus eventos", icon: LayoutDashboard, group: "Gestão" },
    { href: "/dashboard/new", label: "Novo evento", icon: PlusCircle, group: "Gestão" },
    { href: "/events", label: "Ver vitrine", icon: Calendar, group: "Público" },
  ],
  GATE: [{ href: "/check-in", label: "Portaria", icon: ScanLine }],
};

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useUiStore((state) => state.sidebarCollapsed);
  const { data: user, isLoading } = useSession();
  const items = user ? NAV_BY_ROLE[user.role] : [];

  function isActive(href: string) {
    if (href === "/dashboard" || href === "/events") return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <>
      <aside
        className={cn(
          "hidden shrink-0 flex-col border-r border-border/60 bg-card transition-[width] duration-150 sm:flex",
          collapsed ? "w-16" : "w-60",
        )}
      >
        <Link
          href={user?.role === "ORGANIZER" ? "/dashboard" : "/events"}
          className="flex h-16 shrink-0 items-center gap-2.5 border-b border-border/60 px-4"
        >
          <span className="grid size-8 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
            <Ticket className="size-4.5" aria-hidden="true" />
          </span>
          <span className={cn("font-bold tracking-[-0.02em]", collapsed && "sr-only")}>Verzel</span>
        </Link>

        <nav aria-label="Navegação principal" className="flex flex-col gap-0.5 overflow-y-auto p-2">
          {isLoading && <div className="mx-1 mt-2 h-8 animate-pulse rounded-md bg-muted" />}
          {items.map((item, index) => (
            <SidebarItem
              key={item.href}
              item={item}
              active={isActive(item.href)}
              collapsed={collapsed}
              // Rótulo do grupo só na primeira ocorrência; recolhida, um
              // rótulo de texto não caberia e viraria ruído truncado.
              showGroup={!collapsed && item.group !== items[index - 1]?.group}
            />
          ))}
        </nav>

        {user && !collapsed && (
          <div className="mt-auto border-t border-border/60 px-4 py-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABEL[user.role]}</p>
          </div>
        )}
      </aside>

      {items.length > 0 && (
        <nav
          aria-label="Navegação principal móvel"
          className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border/60 bg-card px-2 pb-[env(safe-area-inset-bottom)] sm:hidden"
        >
          {items.map(({ href, label, icon: Icon }) => {
            const active = isActive(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "relative flex min-w-0 flex-1 flex-col items-center gap-1 px-2 py-2 text-[0.7rem] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {/* No mobile o trilho vai no topo: é a borda que o usuário
                    associa à barra, e cor sozinha não marcaria o item. */}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-primary"
                  />
                )}
                <Icon className="size-4" aria-hidden="true" />
                <span className="truncate">{label}</span>
              </Link>
            );
          })}
        </nav>
      )}
    </>
  );
}

function SidebarItem({
  item,
  active,
  collapsed,
  showGroup,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  showGroup: boolean;
}) {
  const { href, label, icon: Icon, group } = item;

  return (
    <>
      {showGroup && group && (
        <p className="mt-3 mb-1 px-3 text-[0.65rem] font-semibold tracking-[0.12em] text-muted-foreground uppercase first:mt-0">
          {group}
        </p>
      )}
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        title={collapsed ? label : undefined}
        className={cn(
          "relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          active
            ? // Trilho lateral + fundo sutil, no lugar do bloco sólido de cor
              // primária: o bloco cheio competia em peso com a tabela, que é
              // o conteúdo real da tela.
              "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        {active && (
          <span
            aria-hidden="true"
            className="absolute inset-y-1.5 left-0 w-0.5 rounded-r-full bg-primary"
          />
        )}
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        <span className={cn("truncate", collapsed && "sr-only")}>{label}</span>
      </Link>
    </>
  );
}

const ROLE_LABEL: Record<Role, string> = {
  CUSTOMER: "Cliente",
  ORGANIZER: "Organizador",
  GATE: "Portaria",
};
