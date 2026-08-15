import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterAll, afterEach, beforeAll } from "vitest";

import { server } from "./src/test/msw";

// jsdom não implementa ResizeObserver e não calcula layout, então observar
// nunca produziria uma medida útil aqui de qualquer forma. O stub existe só
// para o componente montar; quem depende das medidas (CarouselTrack) as
// injeta explicitamente no próprio teste.
if (!("ResizeObserver" in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => {
  server.resetHandlers();
  cleanup();
});
afterAll(() => server.close());
