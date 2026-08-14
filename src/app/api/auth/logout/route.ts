import { NextResponse, type NextRequest } from "next/server";

import { apiServer } from "@/server/api-client";
import { clearSessionCookies, readSessionCookies } from "@/server/session";

/**
 * Encerra só a sessão apresentada (`refreshToken` do cookie). Mesmo que a
 * chamada à API falhe — token já revogado, rede fora, accessToken já
 * vencido — os cookies locais são sempre limpos: o usuário pediu para sair,
 * e um 204 "quase silencioso" no pior caso é preferível a travar o logout.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = readSessionCookies(request);

  if (session.refreshToken) {
    await apiServer("/auth/logout", {
      method: "POST",
      body: { refreshToken: session.refreshToken },
      accessToken: session.accessToken,
    }).catch(() => {
      // Silencioso de propósito — ver comentário acima.
    });
  }

  const response = new NextResponse(null, { status: 204 });
  clearSessionCookies(response);
  return response;
}
