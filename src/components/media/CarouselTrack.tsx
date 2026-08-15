"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

interface CarouselTrackProps {
  /** Nome acessível da região — cada trilha da página precisa do seu. */
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Trilha horizontal com scroll-snap nativo.
 *
 * Sem biblioteca de propósito: o navegador já resolve arrasto, inércia,
 * momentum em toque e rolagem por teclado melhor do que uma reimplementação.
 * O que resta em JS é só o que o CSS não faz — saber se ainda há conteúdo
 * para cada lado, para desabilitar as setas nas extremidades.
 *
 * Nada rotaciona sozinho: as setas são atalho de ponteiro. A ordem de
 * tabulação atravessa os próprios cards, então quem usa teclado nunca depende
 * delas (ver DECISIONS.md → "Carrossel sem biblioteca e sem rotação automática").
 */
export function CarouselTrack({ label, children, className }: CarouselTrackProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [overflow, setOverflow] = useState({ start: false, end: false });

  const syncOverflow = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;

    const maxScroll = track.scrollWidth - track.clientWidth;
    // Margem de 1px absorve o arredondamento subpixel do zoom do navegador,
    // que senão deixa a seta do fim habilitada para sempre.
    setOverflow({
      start: track.scrollLeft > 1,
      end: track.scrollLeft < maxScroll - 1,
    });
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    syncOverflow();
    // ResizeObserver cobre os dois motivos de o overflow mudar sem scroll:
    // a viewport muda de largura, ou os filhos chegam depois (fim do loading).
    const observer = new ResizeObserver(syncOverflow);
    observer.observe(track);
    for (const child of track.children) observer.observe(child);

    return () => observer.disconnect();
  }, [syncOverflow, children]);

  function scrollByPage(direction: -1 | 1) {
    const track = trackRef.current;
    if (!track) return;
    // Uma "página" é 90% da área visível: a sobra deixa um card parcialmente
    // visível como pista de que a trilha continua.
    track.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
  }

  return (
    <div className="group/carousel relative">
      <div
        ref={trackRef}
        role="group"
        aria-label={label}
        onScroll={syncOverflow}
        className={cn(
          "scrollbar-none flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth",
          // scroll-p garante que o snap não encoste o card na borda do
          // contêiner, e py deixa o anel de foco respirar sem ser cortado.
          "scroll-px-1 px-1 py-2 sm:gap-4",
          className,
        )}
      >
        {children}
      </div>

      {/* Setas: `pointer-fine` esconde em toque, onde o arrasto é melhor e o
          controle sobreporia o conteúdo. Aparecem no hover ou quando alguma
          delas recebe foco por teclado.

          Trilha que cabe inteira na tela não renderiza seta alguma — dois
          botões permanentemente desabilitados só poluiriam a árvore de
          acessibilidade. Esconder com `aria-hidden` foi descartado: o padrão
          proíbe elemento focável dentro de subárvore escondida. */}
      {(overflow.start || overflow.end) && (
        <div className="pointer-events-none absolute inset-y-0 right-0 left-0 hidden items-center justify-between px-1 opacity-0 transition-opacity group-hover/carousel:opacity-100 group-focus-within/carousel:opacity-100 pointer-fine:flex">
          <ArrowButton
            direction="start"
            label={`Voltar em ${label}`}
            disabled={!overflow.start}
            onClick={() => scrollByPage(-1)}
          />
          <ArrowButton
            direction="end"
            label={`Avançar em ${label}`}
            disabled={!overflow.end}
            onClick={() => scrollByPage(1)}
          />
        </div>
      )}
    </div>
  );
}

function ArrowButton({
  direction,
  label,
  disabled,
  onClick,
}: {
  direction: "start" | "end";
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "start" ? ChevronLeft : ChevronRight;

  return (
    <Button
      type="button"
      size="icon-lg"
      variant="secondary"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      // A camada externa é pointer-events-none para não roubar o hover dos
      // cards; cada botão reativa o ponteiro só sobre si.
      className="pointer-events-auto rounded-full bg-cinema/85 text-cinema-foreground shadow-lg backdrop-blur-sm hover:bg-cinema disabled:opacity-0"
    >
      <Icon className="size-5" />
    </Button>
  );
}
