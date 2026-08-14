import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { AppShell } from "@/components/layout/AppShell";

export default async function HomePage() {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <AppShell title="Início" theme={theme}>
      <p className="text-sm text-muted-foreground">
        Fundação do projeto. As telas chegam a partir do epic 02.
      </p>
    </AppShell>
  );
}
