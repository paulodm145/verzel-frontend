import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

interface EventPosterProps {
  imageUrl: string | null;
  className?: string;
}

/**
 * Quadro 2:3 do pôster.
 *
 * O spec 009 §5.3 proíbe recortar a arte, mas `object-contain` sozinho deixa
 * barras vazias em pôster de proporção diferente — o oposto do preenchimento
 * que uma vitrine precisa. A saída é a mesma imagem duas vezes: uma em
 * `object-cover` desfocada como fundo, outra inteira por cima. Preenche o
 * quadro sem sacrificar um pixel da arte, e não custa requisição extra porque
 * as duas usam a mesma URL já em cache do navegador.
 */
export function EventPoster({ imageUrl, className }: EventPosterProps) {
  return (
    <div
      className={cn(
        "relative aspect-2/3 w-full shrink-0 overflow-hidden rounded-media bg-cinema",
        className,
      )}
    >
      {imageUrl ? (
        <>
          {/*
            Imagem vem de provedor externo (TMDb/Ticketmaster), domínio
            imprevisível — <img> em vez de next/image evita manter uma
            allowlist de hosts que o organizador não controla.
          */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-xl"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            loading="lazy"
            className="relative h-full w-full object-contain"
          />
        </>
      ) : (
        // Mesma proporção do caso com imagem: sem isso, uma linha mista de
        // eventos com e sem pôster desalinharia e causaria layout shift.
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <ImageOff className="size-6 text-muted-foreground" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
