/**
 * Matemática de contraste para o teste de temas.
 *
 * Vive em `src/test` porque não é código de aplicação: existe só para o
 * `theme-contrast.test.ts` conferir a promessa de AA nos dois temas sem
 * depender de alguém reconferir números escritos à mão em comentário.
 */

/** oklch(L C H) → sRGB linear, o espaço em que a luminância é calculada. */
export function oklchToLinearRgb(lightness: number, chroma: number, hueDeg: number): number[] {
  const hue = (hueDeg * Math.PI) / 180;
  const a = chroma * Math.cos(hue);
  const b = chroma * Math.sin(hue);

  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    // Cor fora do gamut sRGB é recortada pelo navegador do mesmo jeito.
  ].map((channel) => Math.min(1, Math.max(0, channel)));
}

/** `#rrggbb` → sRGB linear, desfazendo a curva de gama. */
export function hexToLinearRgb(hex: string): number[] {
  return [1, 3, 5].map((offset) => {
    const channel = parseInt(hex.slice(offset, offset + 2), 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });
}

/** Razão de contraste da WCAG 2.x entre duas cores em sRGB linear. */
export function contrastRatio(first: number[], second: number[]): number {
  const luminance = ([r, g, b]: number[]) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Lê os tokens `--nome: oklch(...)` do primeiro bloco que casa com `selector`. */
export function parseOklchTokens(css: string, selector: RegExp): Record<string, number[]> {
  const start = css.search(selector);
  if (start === -1) throw new Error(`bloco não encontrado: ${selector}`);

  const block = css.slice(start, css.indexOf("}", css.indexOf("{", start)));
  const tokens: Record<string, number[]> = {};
  for (const [, name, l, c, h] of block.matchAll(
    /--([\w-]+):\s*oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)?\)/g,
  )) {
    tokens[name] = oklchToLinearRgb(Number(l), Number(c), Number(h ?? 0));
  }
  return tokens;
}
