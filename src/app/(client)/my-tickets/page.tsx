import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { AppShell } from "@/components/layout/AppShell";
import { MyTicketsScreen } from "@/features/tickets/components/MyTicketsScreen";

export default async function MyTicketsPage() {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <AppShell title="Meus ingressos" theme={theme}>
      <MyTicketsScreen />
    </AppShell>
  );
}
