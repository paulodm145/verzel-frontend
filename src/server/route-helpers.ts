/**
 * Peças compartilhadas pelos route handlers de `/api/auth/*`: converter
 * `ApiError` para o envelope de resposta, e o fluxo comum de login/registro
 * (mesmo formato de resposta da API, mesma gravação de cookies).
 */
import { NextResponse } from "next/server";

import { isApiError } from "@/lib/api-errors";

import { apiServer } from "./api-client";
import { writeSessionCookies, type SessionUser } from "./session";

export function apiErrorResponse(error: unknown): NextResponse {
  if (isApiError(error)) {
    return NextResponse.json(
      {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
          requestId: error.requestId,
        },
      },
      { status: error.status },
    );
  }

  return NextResponse.json(
    { error: { code: "INTERNAL_ERROR", message: "Falha inesperada ao falar com o servidor" } },
    { status: 500 },
  );
}

interface AuthEntryApiResponse {
  user: { id: string; name: string; email: string; role: SessionUser["role"]; createdAt: string };
  session: { accessToken: string; refreshToken: string; expiresIn: number };
}

/** Login e cadastro devolvem o mesmo formato na API — grava os 4 cookies e
 * responde só com o recorte de usuário que a UI precisa. `vz_user` não é
 * credencial, então nunca inclui e-mail nem outros dados sensíveis. */
export async function handleAuthEntry(
  path: "/auth/login" | "/auth/register",
  credentials: unknown,
) {
  try {
    const data = await apiServer<AuthEntryApiResponse>(path, { method: "POST", body: credentials });
    const user: SessionUser = { id: data.user.id, name: data.user.name, role: data.user.role };

    const response = NextResponse.json({ user }, { status: path === "/auth/register" ? 201 : 200 });
    writeSessionCookies(response, { ...data.session, user });
    return response;
  } catch (error) {
    return apiErrorResponse(error);
  }
}
