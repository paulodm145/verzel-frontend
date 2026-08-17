/**
 * Proteção de rotas por papel. No Next 16.3, a convenção `middleware.ts` foi
 * substituída por `proxy.ts`; a regra continua sendo apenas UX, pois o gate
 * real de autorização é o `403` devolvido pela API.
 */
import { NextResponse, type NextRequest } from "next/server";

import { parseSessionUser, type Role } from "@/server/session";

const ROLE_BY_PREFIX: ReadonlyArray<{ prefix: string; role: Role }> = [
  { prefix: "/events/", role: "CUSTOMER" },
  { prefix: "/my-tickets", role: "CUSTOMER" },
  { prefix: "/dashboard", role: "ORGANIZER" },
  { prefix: "/check-in", role: "GATE" },
];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const rule = ROLE_BY_PREFIX.find(({ prefix }) =>
    prefix === "/events/"
      ? /^\/events\/[^/]+\/checkout(?:\/|$)/.test(pathname)
      : pathname.startsWith(prefix),
  );
  if (!rule) return NextResponse.next();

  const user = parseSessionUser(request.cookies.get("vz_user")?.value);

  if (!user) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (user.role !== rule.role) {
    // Leva o destino pretendido: sem ele, o 403 só sabe dizer "use outra
    // conta" e deixa a pessoa adivinhar como voltar para onde ia.
    const url = new URL("/403", request.url);
    url.searchParams.set("next", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/events/:id/checkout/:path*",
    "/my-tickets/:path*",
    "/dashboard/:path*",
    "/check-in/:path*",
  ],
};
