import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { AppShell } from "@/components/layout/AppShell";
import { EventDetailScreen } from "@/features/events/components/EventDetailScreen";

export default async function EventDetailPage(props: PageProps<"/dashboard/[id]">) {
  const { id } = await props.params;
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <AppShell title="Editar evento" theme={theme}>
      <EventDetailScreen id={id} />
    </AppShell>
  );
}
