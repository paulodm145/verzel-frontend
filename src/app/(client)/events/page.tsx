import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { PublicShell } from "@/components/layout/PublicShell";
import { EventsExplorer } from "@/features/events/components/EventsExplorer";

export default async function EventsPage() {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <PublicShell theme={theme}>
      <div className="mb-8 max-w-2xl pt-4">
        <p className="text-xs font-semibold tracking-[0.16em] text-primary uppercase">
          Programação
        </p>
        <h1 className="mt-1 text-4xl font-bold tracking-[-0.035em] sm:text-5xl">
          Encontre sua sessão
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Encontre filmes e shows, consulte os detalhes e escolha seu assento.
        </p>
      </div>
      <EventsExplorer />
    </PublicShell>
  );
}
