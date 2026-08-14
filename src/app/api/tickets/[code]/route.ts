/**
 * Passthrough público para `GET /tickets/:code` (05-ingressos-e-portaria.md).
 *
 * Não usa o proxy genérico `/api/v/[...path]` de propósito: aquele exige
 * `vz_at` incondicionalmente (server/proxy.ts) e devolveria 401 para quem
 * abre o link compartilhado sem sessão nenhuma — exatamente o público deste
 * endpoint. `/tickets/:code` é público na API (sem token), então este route
 * handler fala direto com `apiServer`, sem `accessToken`, igual a
 * `/api/auth/login` já faz para as rotas fora do prefixo `/api/v`.
 */
import { NextResponse } from "next/server";

import { isApiError } from "@/lib/api-errors";
import { apiServer } from "@/server/api-client";

import type { PublicTicket } from "@/features/tickets/types";

interface RouteContext {
  params: Promise<{ code: string }>;
}

export async function GET(_request: Request, { params }: RouteContext): Promise<NextResponse> {
  const { code } = await params;

  try {
    const ticket = await apiServer<PublicTicket>(`/tickets/${encodeURIComponent(code)}`);
    return NextResponse.json(ticket);
  } catch (error) {
    if (isApiError(error)) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message, requestId: error.requestId } },
        { status: error.status },
      );
    }
    throw error;
  }
}
