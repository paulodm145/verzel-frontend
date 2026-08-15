"use client";

import Link from "next/link";

import { ArrowRight, Ticket } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useSession } from "@/features/auth/hooks/useSession";

import { formatEventPrice } from "../format";

export function PurchaseCallout({
  eventId,
  price,
  availableSeats,
}: {
  eventId: string;
  price: number;
  availableSeats: number;
}) {
  const { data: user, isLoading } = useSession();
  const checkoutPath = `/events/${eventId}/checkout`;
  const href =
    user?.role === "CUSTOMER" ? checkoutPath : `/login?next=${encodeURIComponent(checkoutPath)}`;
  const soldOut = availableSeats === 0;

  return (
    <aside className="rounded-2xl bg-muted/65 p-6 shadow-sm lg:sticky lg:top-24">
      <div className="flex items-center gap-2 text-primary">
        <Ticket className="size-5" aria-hidden="true" />
        <span className="text-sm font-semibold">Ingresso por assento</span>
      </div>
      <p className="mt-4 text-3xl font-semibold tracking-tight">{formatEventPrice(price)}</p>
      <p className="mt-1 text-sm text-muted-foreground">
        {soldOut ? "Ingressos esgotados" : `${availableSeats} assentos disponíveis`}
      </p>
      <Button
        nativeButton={soldOut}
        size="lg"
        className="mt-5 w-full"
        disabled={soldOut || isLoading}
        render={!soldOut ? <Link href={href} /> : undefined}
      >
        {user && user.role !== "CUSTOMER" ? "Entrar como cliente para comprar" : "Escolher assento"}
        {!soldOut && <ArrowRight className="size-4" />}
      </Button>
      {!user && !isLoading && (
        <p className="mt-3 text-xs leading-5 text-muted-foreground">
          Você poderá explorar livremente. O login será solicitado somente antes da reserva.
        </p>
      )}
    </aside>
  );
}
