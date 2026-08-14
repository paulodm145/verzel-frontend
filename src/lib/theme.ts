export type ThemePreference = "light" | "dark" | "system";

export const THEME_COOKIE = "vz_theme";
export const THEME_MAX_AGE = 60 * 60 * 24 * 365;

const VALID: readonly ThemePreference[] = ["light", "dark", "system"];

export function parseTheme(value: string | undefined): ThemePreference {
  return VALID.includes(value as ThemePreference) ? (value as ThemePreference) : "system";
}

/**
 * Em "system" não devolvemos atributo: sem ele, o bloco
 * @media (prefers-color-scheme: dark) do globals.css assume.
 */
export function themeAttribute(theme: ThemePreference): "light" | "dark" | undefined {
  return theme === "system" ? undefined : theme;
}
