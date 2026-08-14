/**
 * Proteção de rotas por papel (spec seção 2.7). Lê só o cookie `vz_user`
 * (legível, não é credencial) — o gate real é o `403` da API quando as
 * chamadas de dados acontecem; isto aqui é UX, não segurança.
 */
import { NextResponse, type NextRequest } from "next/server";

import { parseSessionUser, type Role } from "@/server/session";

const ROLE_BY_PREFIX: ReadonlyArray<{ prefix: string; role: Role }> = [
  { prefix: "/events", role: "CUSTOMER" },
  { prefix: "/my-tickets", role: "CUSTOMER" },
  { prefix: "/dashboard", role: "ORGANIZER" },
  { prefix: "/check-in", role: "GATE" },
];

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const rule = ROLE_BY_PREFIX.find(({ prefix }) => pathname.startsWith(prefix));
  if (!rule) return NextResponse.next();

  const user = parseSessionUser(request.cookies.get("vz_user")?.value);

  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Sessão válida, papel errado: manda para /403, nunca para o login — a
  // sessão em si não expirou, só não dá para essa área.
  if (user.role !== rule.role) {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/events/:path*", "/my-tickets/:path*", "/dashboard/:path*", "/check-in/:path*"],
};
