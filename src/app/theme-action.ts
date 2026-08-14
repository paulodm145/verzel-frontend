"use server";

import { cookies } from "next/headers";

import { THEME_COOKIE, THEME_MAX_AGE, type ThemePreference } from "@/lib/theme";

export async function setTheme(theme: ThemePreference): Promise<void> {
  const store = await cookies();

  store.set(THEME_COOKIE, theme, {
    path: "/",
    maxAge: THEME_MAX_AGE,
    sameSite: "lax",
    // Sem httpOnly: preferência de UI não é credencial.
  });
}
