"use client";

import * as React from "react";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { XIcon } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { DialogOverlay, DialogPortal } from "@/components/ui/dialog";

/**
 * Larguras fixas (não percentuais) por tamanho — decisão da spec 4.1: um
 * modal de confirmação (`sm`) não deve crescer/encolher com a viewport do
 * mesmo jeito que um formulário longo (`xl`).
 */
const MODAL_SIZE_CLASSES = {
  sm: "sm:max-w-96",
  md: "sm:max-w-[32rem]",
  lg: "sm:max-w-[40rem]",
  xl: "sm:max-w-[48rem]",
} as const;

export type ModalSize = keyof typeof MODAL_SIZE_CLASSES;

interface ModalRootProps extends Omit<DialogPrimitive.Root.Props, "children"> {
  /** sm|md|lg|xl — larguras fixas, ver MODAL_SIZE_CLASSES. */
  size?: ModalSize;
  /**
   * Bootstrap-style "static backdrop": clique fora não fecha o modal. Usado
   * em modal com formulário sujo, onde fechar sem querer perderia dados.
   */
  staticBackdrop?: boolean;
  children: React.ReactNode;
}

function ModalRoot({
  size = "md",
  staticBackdrop = false,
  children,
  ...rootProps
}: ModalRootProps) {
  return (
    <DialogPrimitive.Root disablePointerDismissal={staticBackdrop} {...rootProps}>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Popup
          data-slot="modal-content"
          className={cn(
            "fixed top-1/2 left-1/2 z-50 flex max-h-[85vh] w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-popover text-popover-foreground ring-1 ring-foreground/10 duration-100 outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
            MODAL_SIZE_CLASSES[size],
          )}
        >
          {children}
          <DialogPrimitive.Close
            data-slot="modal-close"
            render={<Button variant="ghost" size="icon-sm" className="absolute top-2 right-2" />}
          >
            <XIcon />
            <span className="sr-only">Fechar</span>
          </DialogPrimitive.Close>
        </DialogPrimitive.Popup>
      </DialogPortal>
    </DialogPrimitive.Root>
  );
}

function ModalHeader({ className, children, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-header"
      className={cn("shrink-0 border-b border-border px-4 py-3 pr-10", className)}
      {...props}
    >
      <DialogPrimitive.Title className="font-heading text-base leading-tight font-medium">
        {children}
      </DialogPrimitive.Title>
    </div>
  );
}

function ModalBody({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-body"
      className={cn("min-h-0 flex-1 overflow-y-auto p-4 text-sm", className)}
      {...props}
    />
  );
}

function ModalFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="modal-footer"
      className={cn(
        "flex shrink-0 flex-row items-center justify-end gap-2 border-t border-border bg-muted/40 px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Composição Bootstrap-like (Header/Body/Footer) por cima do Dialog do
 * shadcn/base-ui — a API acertou (header/body/footer, tamanhos, backdrop
 * estático), o motor de acessibilidade (foco preso, Escape, aria-modal) vem
 * de baixo, do base-ui. Body rola sozinho; header e footer ficam fixos.
 */
export const Modal = Object.assign(ModalRoot, {
  Header: ModalHeader,
  Body: ModalBody,
  Footer: ModalFooter,
});
