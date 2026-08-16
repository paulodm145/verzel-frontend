import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SESSION_QUERY_KEY } from "@/features/auth/hooks/useSession";
import type { Role, SessionUser } from "@/features/auth/types";

import { PublicHeader } from "./PublicHeader";

vi.mock("next/navigation", () => ({ useRouter: () => ({ replace: vi.fn() }) }));

const AREA_BY_ROLE: Record<Role, string> = {
  CUSTOMER: "/my-tickets",
  ORGANIZER: "/dashboard",
  GATE: "/check-in",
};

/**
 * A sessão entra pronta no cache em vez de vir por MSW: o que se testa aqui é
 * a decisão do header sobre o papel, não a busca da sessão (coberta em
 * useSession). Sem rede, o render é síncrono e o teste não depende de tempo.
 */
function renderHeader(user: SessionUser | null) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  client.setQueryData(SESSION_QUERY_KEY, user);

  return render(
    <QueryClientProvider client={client}>
      <PublicHeader theme="light" />
    </QueryClientProvider>,
  );
}

const userWith = (role: Role): SessionUser => ({ id: "u-1", name: "Fulano", role });

/**
 * O header público é a única navegação que os três papéis compartilham — é
 * onde vazar ferramenta de outro papel seria mais fácil. O gate real continua
 * sendo o 403 da API; o que se cobre aqui é a promessa do spec 009 §10 de que
 * ninguém enxerga atalho que não lhe pertence.
 */
describe("PublicHeader", () => {
  it("visitante vê entrar e criar conta, e nenhuma área interna", () => {
    renderHeader(null);

    expect(screen.getByRole("button", { name: "Entrar" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("button", { name: "Criar conta" })).toHaveAttribute(
      "href",
      "/register",
    );

    for (const path of Object.values(AREA_BY_ROLE)) {
      expect(document.querySelector(`a[href="${path}"]`)).toBeNull();
    }
    expect(screen.queryByRole("button", { name: "Sair da conta" })).not.toBeInTheDocument();
  });

  it.each([
    ["CUSTOMER", "Meus ingressos"],
    ["ORGANIZER", "Minha área"],
    ["GATE", "Minha área"],
  ] as const)("%s só recebe atalho para a própria área", (role, label) => {
    renderHeader(userWith(role));

    expect(screen.getByRole("button", { name: label })).toHaveAttribute("href", AREA_BY_ROLE[role]);

    // Nenhum link para a área dos outros dois papéis.
    for (const [otherRole, path] of Object.entries(AREA_BY_ROLE)) {
      if (otherRole === role) continue;
      expect(document.querySelector(`a[href="${path}"]`)).toBeNull();
    }

    // Quem já está autenticado não vê convite para entrar ou se cadastrar.
    expect(screen.queryByRole("button", { name: "Entrar" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Criar conta" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sair da conta" })).toBeInTheDocument();
  });

  it("mantém o catálogo alcançável em qualquer sessão", () => {
    renderHeader(userWith("ORGANIZER"));

    expect(screen.getByRole("link", { name: "Eventos" })).toHaveAttribute("href", "/events");
  });
});
