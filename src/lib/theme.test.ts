import { describe, expect, it } from "vitest";

import { parseTheme, themeAttribute } from "./theme";

describe("parseTheme", () => {
  it("aceita os três valores válidos", () => {
    expect(parseTheme("light")).toBe("light");
    expect(parseTheme("dark")).toBe("dark");
    expect(parseTheme("system")).toBe("system");
  });

  it("cai em system quando o cookie não existe", () => {
    expect(parseTheme(undefined)).toBe("system");
  });

  it("cai em system quando o cookie foi adulterado", () => {
    expect(parseTheme("<script>")).toBe("system");
  });
});

describe("themeAttribute", () => {
  it("devolve o valor do atributo para escolha explícita", () => {
    expect(themeAttribute("light")).toBe("light");
    expect(themeAttribute("dark")).toBe("dark");
  });

  it("não devolve atributo em system, para o CSS decidir pela mídia", () => {
    expect(themeAttribute("system")).toBeUndefined();
  });
});
