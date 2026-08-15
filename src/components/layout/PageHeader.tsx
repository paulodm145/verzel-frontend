import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  /** Rótulo curto acima do título — o contexto da tela, não uma repetição dele. */
  eyebrow?: string;
  description?: string;
  /** Selo ao lado do título — status do registro, não uma ação. */
  titleBadge?: ReactNode;
  /** Ações primárias da tela, alinhadas à direita em telas largas. */
  actions?: ReactNode;
  className?: string;
}

/**
 * Cabeçalho das telas do organizador. Existe porque cada tela remontava esse
 * bloco à mão, e a hierarquia acabava diferente em cada uma — que é
 * exatamente o defeito que o CLAUDE.md chama de "tipografia sem hierarquia
 * real". Densidade de painel: sem respiro de vitrine, sem ilustração.
 */
export function PageHeader({
  title,
  eyebrow,
  description,
  titleBadge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4",
        className,
      )}
    >
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-muted-foreground uppercase">
            {eyebrow}
          </p>
        )}
        <div className="mt-1 flex min-w-0 items-center gap-2">
          <h1 className="truncate text-xl font-bold tracking-[-0.02em]">{title}</h1>
          {titleBadge}
        </div>
        {description && (
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
