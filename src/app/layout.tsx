import type { Metadata } from "next";
import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE, themeAttribute } from "@/lib/theme";

import { Providers } from "./providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "Verzel — Eventos e Ingressos",
  description: "Plataforma de eventos e ingressos",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const theme = parseTheme((await cookies()).get(THEME_COOKIE)?.value);

  return (
    <html
      lang="pt-BR"
      data-theme={themeAttribute(theme)}
      className="h-full antialiased"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
