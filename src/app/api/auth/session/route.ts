import { NextResponse, type NextRequest } from "next/server";

import { apiServer } from "@/server/api-client";
import { renewSession } from "@/server/refresh";
import { apiErrorResponse } from "@/server/route-helpers";
import {
  readSessionCookies,
  writeSessionCookies,
  writeUserCookie,
  type SessionUser,
} from "@/server/session";

interface MeResponse {
  id: string;
  name: string;
  role: SessionUser["role"];
}

/**
 * Reidratação no boot (spec seção 2.5). Caminho rápido: `vz_user` já existe,
 * devolve sem tocar a API. Caminho lento: `vz_user` sumiu mas há `vz_at`/
 * `vz_rt` — chama `GET /auth/me` (e renova primeiro se só sobrou o refresh
 * token) e regrava o cookie. Sem nenhum dos dois, não há sessão: 401.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const session = readSessionCookies(request);

  if (session.user) {
    return NextResponse.json({ user: session.user });
  }

  if (!session.accessToken && !session.refreshToken) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "Sessão inválida ou expirada" } },
      { status: 401 },
    );
  }

  try {
    let accessToken = session.accessToken;
    let renewed: { accessToken: string; refreshToken: string; expiresIn: number } | undefined;

    if (!accessToken && session.refreshToken) {
      renewed = await renewSession(session.refreshToken);
      accessToken = renewed.accessToken;
    }

    const me = await apiServer<MeResponse>("/auth/me", { accessToken });
    const user: SessionUser = { id: me.id, name: me.name, role: me.role };

    const response = NextResponse.json({ user });
    if (renewed) {
      writeSessionCookies(response, { ...renewed, user });
    } else {
      writeUserCookie(response, user);
    }
    return response;
  } catch (error) {
    return apiErrorResponse(error);
  }
}
