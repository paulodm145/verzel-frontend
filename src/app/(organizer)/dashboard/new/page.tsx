import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { AppShell } from "@/components/layout/AppShell";
import { NewEventScreen } from "@/features/events/components/NewEventScreen";

export default async function NewEventPage() {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <AppShell title="Novo evento" theme={theme}>
      <NewEventScreen />
    </AppShell>
  );
}
