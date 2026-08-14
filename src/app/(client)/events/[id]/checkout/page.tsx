import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE } from "@/lib/theme";

import { AppShell } from "@/components/layout/AppShell";
import { CheckoutFlow } from "@/features/reservations/components/CheckoutFlow";

interface CheckoutPageProps {
  params: Promise<{ id: string }>;
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const { id } = await params;
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <AppShell title="Finalizar reserva" theme={theme}>
      <CheckoutFlow eventId={id} />
    </AppShell>
  );
}
