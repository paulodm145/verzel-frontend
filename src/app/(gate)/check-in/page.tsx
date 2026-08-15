import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { GateShell } from "@/components/layout/GateShell";
import { CheckInScreen } from "@/features/check-in/components/CheckInScreen";

export default async function CheckInPage() {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <GateShell theme={theme}>
      <CheckInScreen />
    </GateShell>
  );
}
