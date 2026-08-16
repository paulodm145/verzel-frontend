import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { contrastRatio, hexToLinearRgb, parseOklchTokens } from "@/test/contrast";
import { describe, expect, it } from "vitest";

/**
 * O spec 009 §7.5 promete AA nos dois temas, inclusive sobre `--cinema`, e o
 * CLAUDE.md repete a promessa para os 4 estados da portaria. Até aqui isso
 * vivia em comentário ao lado dos tokens — número escrito à mão envelhece
 * calado: quem ajusta uma cor não reconfere a razão.
 *
 * Este teste lê o CSS de verdade e recalcula. Não é markup: é a única
 * regra do sistema visual que tem resposta objetiva e custa caro errar.
 */
const css = readFileSync(resolve(import.meta.dirname, "globals.css"), "utf8");

const THEMES = {
  claro: parseOklchTokens(css, /^:root \{/m),
  // Bloco da escolha explícita, que repete os valores do @media do SO.
  escuro: parseOklchTokens(css, /^:root\[data-theme="dark"\] \{/m),
};

// [frente, fundo, alvo]. 4.5 = texto; 3 = borda e demais limites de UI.
const PAIRS: ReadonlyArray<[string, string, number]> = [
  ["foreground", "background", 4.5],
  ["foreground", "card", 4.5],
  ["muted-foreground", "background", 4.5],
  ["muted-foreground", "card", 4.5],
  ["muted-foreground", "muted", 4.5],
  ["primary", "background", 4.5],
  ["primary", "card", 4.5],
  ["primary-foreground", "primary", 4.5],
  ["secondary-foreground", "secondary", 4.5],
  ["accent-foreground", "accent", 4.5],
  ["destructive", "background", 4.5],
  ["destructive", "card", 4.5],
  // A superfície escura dos dois temas — o lugar mais fácil de errar.
  ["cinema-foreground", "cinema", 4.5],
  ["cinema-muted", "cinema", 4.5],
  ["border", "background", 3],
  ["border", "card", 3],
  ["input", "background", 3],
  ["input", "card", 3],
  ["ring", "background", 3],
  ["ring", "card", 3],
];

describe("contraste dos tokens de tema", () => {
  for (const [theme, tokens] of Object.entries(THEMES)) {
    describe(`tema ${theme}`, () => {
      it("declara todos os tokens usados nos pares verificados", () => {
        const missing = [...new Set(PAIRS.flatMap(([fg, bg]) => [fg, bg]))].filter(
          (token) => !tokens[token],
        );
        expect(missing).toEqual([]);
      });

      it.each(PAIRS)("%s sobre %s atinge %s:1", (foreground, background, target) => {
        const ratio = contrastRatio(tokens[foreground], tokens[background]);
        expect(
          ratio,
          `${foreground}/${background} no tema ${theme}: ${ratio.toFixed(2)}:1`,
        ).toBeGreaterThanOrEqual(target);
      });
    });
  }
});

/**
 * Os 4 estados da portaria trazem a cor embutida em classe utilitária, não em
 * token — são as únicas cores fixas da aplicação, escolhidas para serem
 * legíveis a um braço de distância. O teste lê o próprio componente para que
 * trocar um hex sem conferir o contraste quebre aqui.
 */
const validationSource = readFileSync(
  resolve(import.meta.dirname, "../features/check-in/components/ValidationResult.tsx"),
  "utf8",
);

const GATE_STATES = [
  ...validationSource.matchAll(
    /bg-\[(#[0-9a-f]{6})\]\s+text-(white|\[#[0-9a-f]{6}\])\s+dark:bg-\[(#[0-9a-f]{6})\]\s+dark:text-\[(#[0-9a-f]{6})\]/g,
  ),
].map(([, lightBg, lightFg, darkBg, darkFg]) => ({
  lightBg,
  lightFg: lightFg === "white" ? "#ffffff" : lightFg.slice(1, -1),
  darkBg,
  darkFg,
}));

describe("contraste dos 4 estados da portaria", () => {
  it("encontra os 4 estados no componente", () => {
    // Se a forma de escrever a paleta mudar, o teste falha aqui em vez de
    // passar vazio — cobertura silenciosamente perdida é pior que ausente.
    expect(GATE_STATES).toHaveLength(4);
  });

  it.each(GATE_STATES)("estado %#: legível nos dois temas", (state) => {
    const light = contrastRatio(hexToLinearRgb(state.lightFg), hexToLinearRgb(state.lightBg));
    const dark = contrastRatio(hexToLinearRgb(state.darkFg), hexToLinearRgb(state.darkBg));

    expect(
      light,
      `claro ${state.lightFg}/${state.lightBg}: ${light.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(
      dark,
      `escuro ${state.darkFg}/${state.darkBg}: ${dark.toFixed(2)}:1`,
    ).toBeGreaterThanOrEqual(4.5);
  });
});
