import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SESSION_QUERY_KEY } from "@/features/auth/hooks/useSession";
import type { Role, SessionUser } from "@/features/auth/types";

import { PurchaseCallout } from "./PurchaseCallout";

const EVENT_ID = "evento-1";
const CHECKOUT = `/events/${EVENT_ID}/checkout`;

/** Sessão pronta no cache: o que se testa é o destino do CTA, não o fetch. */
function renderCallout(user: SessionUser | null, availableSeats = 12) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(SESSION_QUERY_KEY, user);

  return render(
    <QueryClientProvider client={client}>
      <PurchaseCallout eventId={EVENT_ID} price={45} availableSeats={availableSeats} />
    </QueryClientProvider>,
  );
}

const userWith = (role: Role): SessionUser => ({ id: "u-1", name: "Fulano", role });

/**
 * O CTA é a dobradiça da jornada do spec 009 §6: é ele que decide entre
 * mandar direto ao checkout ou passar pelo login carregando o destino. Errar
 * o `next` aqui devolve o visitante ao catálogo depois de autenticar — o
 * abandono mais caro do fluxo, e invisível em teste de markup.
 */
describe("PurchaseCallout", () => {
  it("cliente autenticado vai direto ao checkout", () => {
    renderCallout(userWith("CUSTOMER"));

    expect(screen.getByRole("button", { name: /Escolher assento/ })).toHaveAttribute(
      "href",
      CHECKOUT,
    );
  });

  it("visitante passa pelo login levando o checkout como destino", () => {
    renderCallout(null);

    expect(screen.getByRole("button", { name: /Escolher assento/ })).toHaveAttribute(
      "href",
      `/login?next=${encodeURIComponent(CHECKOUT)}`,
    );
  });

  it.each(["ORGANIZER", "GATE"] as const)(
    "%s é convidado a entrar como cliente, sem perder o destino",
    (role) => {
      renderCallout(userWith(role));

      // Sessão de outro papel não compra: o checkout exige CUSTOMER, então o
      // caminho é o mesmo do visitante — login com o destino preservado.
      expect(
        screen.getByRole("button", { name: /Entrar como cliente para comprar/ }),
      ).toHaveAttribute("href", `/login?next=${encodeURIComponent(CHECKOUT)}`);
    },
  );

  it("evento esgotado não oferece caminho para o checkout", () => {
    renderCallout(userWith("CUSTOMER"), 0);

    const cta = screen.getByRole("button", { name: /Escolher assento/ });
    expect(cta).toBeDisabled();
    expect(cta).not.toHaveAttribute("href");
    expect(screen.getByText("Ingressos esgotados")).toBeInTheDocument();
  });
});
