"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";

import { Modal } from "./Modal";

export interface ConfirmOptions {
  /** Título curto — vira o Modal.Header. */
  title: string;
  /** Texto de apoio opcional — vira o Modal.Body quando presente. */
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "destructive" pinta o botão de confirmar como ação irreversível/perigosa. */
  tone?: "default" | "destructive";
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

interface PendingConfirm extends ConfirmOptions {
  resolve: (value: boolean) => void;
}

/**
 * "Tem certeza?" aparece em cancelar evento, cancelar reserva, publicar
 * evento e logout — sem isto seriam quatro modais copiados e colados. Monta
 * um único Modal controlado por promise, disponível via useConfirm() em
 * qualquer componente dentro do provider.
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingConfirm | null>(null);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((options) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setPending({ ...options, resolve });
    });
  }, []);

  const settle = useCallback((value: boolean) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setPending(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Modal
        open={pending !== null}
        onOpenChange={(open) => {
          if (!open) settle(false);
        }}
        size="sm"
      >
        {pending && (
          <>
            <Modal.Header>{pending.title}</Modal.Header>
            {pending.description && <Modal.Body>{pending.description}</Modal.Body>}
            <Modal.Footer>
              <Button variant="ghost" onClick={() => settle(false)}>
                {pending.cancelLabel ?? "Cancelar"}
              </Button>
              <Button
                variant={pending.tone === "destructive" ? "destructive" : "default"}
                onClick={() => settle(true)}
              >
                {pending.confirmLabel ?? "Confirmar"}
              </Button>
            </Modal.Footer>
          </>
        )}
      </Modal>
    </ConfirmContext.Provider>
  );
}

/** Confirmação imperativa: `if (await confirmar({ title, tone })) { ... }`. */
export function useConfirm(): ConfirmFn {
  const confirm = useContext(ConfirmContext);
  if (!confirm) {
    throw new Error("useConfirm precisa estar dentro de <ConfirmProvider>");
  }
  return confirm;
}
