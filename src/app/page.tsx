import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { PublicShell } from "@/components/layout/PublicShell";
import { PublicHome } from "@/features/events/components/PublicHome";

export default async function HomePage() {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <PublicShell theme={theme}>
      <PublicHome />
    </PublicShell>
  );
}
