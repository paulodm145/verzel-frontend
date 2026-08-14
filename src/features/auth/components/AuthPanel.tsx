import Link from "next/link";
import type { ReactNode } from "react";

import { TicketIcon } from "lucide-react";

export function AuthPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/40 px-4 py-8">
      <section className="w-full max-w-md overflow-hidden rounded-lg border bg-card text-card-foreground">
        <header className="border-b bg-primary px-6 py-5 text-primary-foreground">
          <Link href="/" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold">
            <TicketIcon className="size-5" aria-hidden="true" />
            Verzel Eventos
          </Link>
          <h1 className="text-xl font-semibold">{title}</h1>
          <p className="mt-1 text-sm opacity-90">{description}</p>
        </header>
        <div className="p-6">{children}</div>
      </section>
    </main>
  );
}
