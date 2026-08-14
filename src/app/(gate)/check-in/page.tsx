import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { AppShell } from "@/components/layout/AppShell";
import { CheckInScreen } from "@/features/check-in/components/CheckInScreen";

export default async function CheckInPage() {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <AppShell title="Portaria" theme={theme}>
      <CheckInScreen />
    </AppShell>
  );
}
