import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { AppShell } from "@/components/layout/AppShell";
import { EventsDashboard } from "@/features/events/components/EventsDashboard";

export default async function DashboardPage() {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <AppShell title="Painel do organizador" theme={theme}>
      <EventsDashboard />
    </AppShell>
  );
}
