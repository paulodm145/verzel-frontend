import { describe, expect, it } from "vitest";

import { parseScannedValue } from "./scanned-value";

const CODE = "TKT-FAGN-VA5K-HUD5";
// Token assinado como a API devolve: cabeçalho.assinatura, sem cara de URL.
const TOKEN =
  "eyJ0aWNrZXRJZCI6IjA0NDNkNzI2IiwiY29kZSI6IlRLVC1GQUdOLVZBNUstSFVENSJ9.6UAzymk8Fq4MVqBa91Lvr0g3wFeb5GbjWUX7fBhoaO0";

describe("parseScannedValue", () => {
  it.each([
    `https://verzel-frontend.vercel.app/ticket/${CODE}`,
    `https://verzel-frontend.vercel.app/ticket/${CODE}/`,
    `http://localhost:3001/ticket/${CODE}`,
    `https://verzel-frontend.vercel.app/ticket/${CODE}?utm=qr`,
  ])("extrai o código da URL lida: %s", (scanned) => {
    expect(parseScannedValue(scanned)).toEqual({ code: CODE });
  });

  it("aceita o código puro, como quem digitou na mão", () => {
    expect(parseScannedValue(` ${CODE} `)).toEqual({ code: CODE });
  });

  it("normaliza o código para maiúsculas", () => {
    expect(parseScannedValue(CODE.toLowerCase())).toEqual({ code: CODE });
  });

  /**
   * Ingresso comprado antes da mudança segue com o token no QR. Recusá-lo
   * seria negar entrada a quem tem ingresso legítimo por causa da data da
   * compra — o pior erro possível na porta.
   */
  it("mantém o token assinado dos ingressos antigos", () => {
    expect(parseScannedValue(TOKEN)).toEqual({ qrContent: TOKEN });
  });

  it("URL sem código de ingresso não vira validação", () => {
    expect(parseScannedValue("https://verzel-frontend.vercel.app/events")).toBeNull();
  });

  it("leitura vazia é ignorada", () => {
    expect(parseScannedValue("   ")).toBeNull();
  });
});
