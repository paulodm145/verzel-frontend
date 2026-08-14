import { useEffect, useState } from "react";

/**
 * Adia a propagação de um valor até que ele pare de mudar por `delayMs`.
 * Usado na busca de eventos para não disparar uma requisição por tecla
 * digitada (07-performance.md item 5: debounce de 300–500 ms).
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
