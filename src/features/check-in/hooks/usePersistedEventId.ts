"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vz_gate_event_id";

/**
 * Evento desta porta, persistido em `localStorage`. Não é dado de servidor
 * (não vai pro Query) nem de sessão (não é o cookie httpOnly) — é
 * preferência deste terminal físico de portaria, que atravessa
 * recarregamentos de página durante o turno do operador. Reescolher o
 * evento a cada F5 seria atrito sem necessidade numa tela pensada para
 * ficar ligada o turno inteiro.
 */
export function usePersistedEventId(): [string, (id: string) => void] {
  const [eventId, setEventIdState] = useState("");

  useEffect(() => {
    // Hidrata só depois de montar, de propósito: ler `localStorage` durante
    // o render (ou num inicializador preguiçoso do `useState`) divergiria
    // do HTML gerado no servidor — que não tem acesso a ele — e quebraria a
    // hidratação. `window` também não existe em SSR, então este `useEffect`
    // é o único lugar seguro para essa leitura.
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- ver comentário acima
    if (stored) setEventIdState(stored);
  }, []);

  function setEventId(id: string): void {
    setEventIdState(id);
    if (id) window.localStorage.setItem(STORAGE_KEY, id);
    else window.localStorage.removeItem(STORAGE_KEY);
  }

  return [eventId, setEventId];
}
