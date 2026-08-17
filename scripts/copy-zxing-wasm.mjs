/**
 * Copia o `.wasm` do leitor de QR para `public/`.
 *
 * O `zxing-wasm` busca esse binário em runtime e, por padrão, na CDN da
 * jsDelivr. Numa portaria isso é o pior lugar possível para uma dependência
 * externa: o navegador que precisa do fallback (Safari no iPhone, Firefox)
 * só descobre que não tem internet no momento em que a fila está esperando.
 *
 * Copiar do próprio `node_modules` — em vez de versionar o binário — garante
 * que o arquivo servido é exatamente o da versão instalada. Versionado, ele
 * silenciosamente descasaria do pacote no primeiro `npm update`.
 */
import { copyFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, resolve } from "node:path";

const require = createRequire(import.meta.url);

const source = require.resolve("zxing-wasm/reader/zxing_reader.wasm");
const target = resolve(import.meta.dirname, "..", "public", "zxing_reader.wasm");

mkdirSync(dirname(target), { recursive: true });
copyFileSync(source, target);

console.log(`zxing_reader.wasm copiado para public/ (de ${source})`);
