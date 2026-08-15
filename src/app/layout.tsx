import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";

import { parseTheme, THEME_COOKIE, themeAttribute } from "@/lib/theme";

import { Providers } from "./providers";

import "./globals.css";

/**
 * Inter vendorizada no repositório, não buscada no Google Fonts: o build não
 * faz chamada externa e um clone continua reprodutível offline (ver
 * DECISIONS.md → "Fontes locais"). Um único arquivo variável cobre 100–900,
 * então não há requisição por peso.
 */
const inter = localFont({
  src: "./fonts/InterVariable.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  // A métrica do fallback é ajustada à da Inter para que a troca no fim do
  // `swap` não empurre o layout.
  adjustFontFallback: "Arial",
});

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
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
