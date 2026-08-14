import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { AppShell } from "@/components/layout/AppShell";
import { EventsExplorer } from "@/features/events/components/EventsExplorer";

export default async function EventsPage() {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <AppShell title="Eventos" theme={theme}>
      <EventsExplorer />
    </AppShell>
  );
}
