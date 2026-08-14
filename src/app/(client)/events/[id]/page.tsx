import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { AppShell } from "@/components/layout/AppShell";
import { EventDetailContent } from "@/features/events/components/EventDetailContent";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const [{ id }, theme] = await Promise.all([
    params,
    cookies().then((store) => parseTheme(store.get(THEME_COOKIE)?.value)),
  ]);

  return (
    <AppShell title="Detalhe do evento" theme={theme}>
      <EventDetailContent eventId={id} />
    </AppShell>
  );
}
