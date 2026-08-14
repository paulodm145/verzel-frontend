"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Trava de 2s entre leituras (05-ingressos-e-portaria.md, "Leitor de QR na
 * web"). Sem ela, a câmera continua enxergando o mesmo QR em quadro,
 * dispara uma segunda validação enquanto a primeira ainda está sendo
 * absorvida na tela, e o operador vê "já utilizado" logo depois de
 * "liberado" — no ingresso que ele acabou de liberar.
 *
 * Fica num hook próprio (em vez de dentro do `QRScanner`) porque tanto o
 * leitor de câmera quanto o `ManualCodeInput` precisam respeitar a mesma
 * trava: um envio manual durante o processamento de uma leitura de câmera
 * não pode disparar uma segunda validação em paralelo.
 */
const DEFAULT_LOCK_MS = 2000;

export interface ScanLock {
  /** `true` enquanto uma validação está em curso OU dentro da janela de
   * espera de 2s depois dela. */
  locked: boolean;
  /** Executa `task` só se destravado; ignora silenciosamente caso contrário.
   * Trava antes de rodar, destrava `lockMs` depois de `task` terminar
   * (sucesso ou falha). */
  guard: (task: () => Promise<void>) => Promise<void>;
  /** Destrava na hora, cancelando a espera — usado pelo "próxima leitura"
   * manual, quando o operador não quer esperar os 2s completos. */
  unlock: () => void;
}

export function useScanLock(lockMs: number = DEFAULT_LOCK_MS): ScanLock {
  const lockedRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [locked, setLocked] = useState(false);

  const unlock = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
    lockedRef.current = false;
    setLocked(false);
  }, []);

  const guard = useCallback(
    async (task: () => Promise<void>) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setLocked(true);
      try {
        await task();
      } finally {
        timeoutRef.current = setTimeout(unlock, lockMs);
      }
    },
    [lockMs, unlock],
  );

  // Não deixa o timeout disparar num componente já desmontado.
  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { locked, guard, unlock };
}
