"use client";

import Link from "next/link";

import { ScanLine } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/hooks/useSession";

/**
 * Ponte entre o QR e a validação.
 *
 * O QR do ingresso carrega esta página, então a câmera nativa de qualquer
 * celular chega aqui. Para o cliente isso já basta — ele queria ver o
 * ingresso. Para a portaria, faltava o passo seguinte: daqui ela vai para
 * `/check-in` com o código já preenchido, e valida em um toque.
 *
 * Só aparece para quem é da portaria, ou para quem não tem sessão (e então
 * passa pelo login levando o destino). Cliente logado não vê botão de
 * validar o próprio ingresso: além de não ter permissão na API, seria um
 * convite a apertar o que não é dele.
 */
export function GateValidationLink({ code }: { code: string }) {
  const { data: user, isLoading } = useSession();
  if (isLoading || user?.role === "CUSTOMER" || user?.role === "ORGANIZER") return null;

  const checkIn = `/check-in?code=${encodeURIComponent(code)}`;
  const href = user?.role === "GATE" ? checkIn : `/login?next=${encodeURIComponent(checkIn)}`;

  return (
    <div className="mt-2 flex flex-col items-center gap-1.5">
      <Button nativeButton={false} variant="outline" size="sm" render={<Link href={href} />}>
        <ScanLine className="size-4" aria-hidden="true" />
        Validar na portaria
      </Button>
      {!user && <p className="text-xs text-muted-foreground">Requer conta de portaria.</p>}
    </div>
  );
}
