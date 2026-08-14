import { TicketByCodeView } from "@/features/tickets/components/TicketByCodeView";

/**
 * Link de compartilhamento (05-ingressos-e-portaria.md). Público de
 * propósito — fora do `matcher` de `middleware.ts`, e o hook por trás
 * (`useTicketByCode`) fala com um passthrough que não exige sessão. Sem
 * `AppShell`: quem abre este link pode nunca ter feito login, então a
 * sidebar com "Painel do organizador" e "Portaria" não faz sentido aqui.
 */
export default async function TicketByCodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-background p-6 text-foreground">
      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-6">
        <TicketByCodeView code={code} />
      </div>
    </main>
  );
}
