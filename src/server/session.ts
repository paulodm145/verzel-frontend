/**
 * Ler, gravar e limpar os quatro cookies de sessão (spec seção 2.3).
 * Deliberadamente opera sobre `NextRequest`/`NextResponse` em vez do
 * `cookies()` assíncrono de `next/headers`: assim as mesmas funções servem
 * tanto os route handlers de `/api/auth/*` quanto o `middleware.ts` (que
 * roda no runtime de Edge e não tem acesso a `next/headers`), e dá para
 * testar sem precisar de um request real do Next em voo.
 */
import type { NextRequest, NextResponse } from "next/server";

export type Role = "CUSTOMER" | "ORGANIZER" | "GATE";

export interface SessionUser {
  id: string;
  name: string;
  role: Role;
}

export interface SessionCookies {
  accessToken?: string;
  refreshToken?: string;
  /** epoch ms — quando passar, o proxy renova antes de encaminhar. */
  renewAt?: number;
  user?: SessionUser | null;
}

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  /** segundos, como a API devolve. */
  expiresIn: number;
  user: SessionUser;
}

const COOKIE = {
  accessToken: "vz_at",
  refreshToken: "vz_rt",
  renewAt: "vz_renew_at",
  user: "vz_user",
} as const;

const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;
// Renova a 80% da vida do accessToken (900s -> aos 720s), para o 401 de
// expiração de rotina praticamente nunca acontecer (spec seção 2.4).
const RENEW_RATIO = 0.8;
const ROLES: readonly Role[] = ["CUSTOMER", "ORGANIZER", "GATE"];

function secureFlag(): boolean {
  return process.env.SESSION_COOKIE_SECURE === "true";
}

function cookieOptions(path: string, maxAge: number, httpOnly: boolean) {
  return { path, maxAge, httpOnly, sameSite: "lax" as const, secure: secureFlag() };
}

/** Parse defensivo — cookie adulterado não pode derrubar o middleware nem a
 * rota de sessão. Mesmo espírito do `parseTheme` em `lib/theme.ts`. */
export function parseSessionUser(raw: string | undefined | null): SessionUser | null {
  if (!raw) return null;

  try {
    const value: unknown = JSON.parse(raw);
    if (
      typeof value === "object" &&
      value !== null &&
      typeof (value as Record<string, unknown>).id === "string" &&
      typeof (value as Record<string, unknown>).name === "string" &&
      ROLES.includes((value as Record<string, unknown>).role as Role)
    ) {
      return value as SessionUser;
    }
    return null;
  } catch {
    return null;
  }
}

export function readSessionCookies(request: NextRequest): SessionCookies {
  const renewAtRaw = request.cookies.get(COOKIE.renewAt)?.value;
  const renewAt = renewAtRaw ? Number(renewAtRaw) : undefined;

  return {
    accessToken: request.cookies.get(COOKIE.accessToken)?.value,
    refreshToken: request.cookies.get(COOKIE.refreshToken)?.value,
    renewAt: renewAt !== undefined && !Number.isNaN(renewAt) ? renewAt : undefined,
    user: parseSessionUser(request.cookies.get(COOKIE.user)?.value),
  };
}

/** Grava os 4 cookies — usada no login, registro e sempre que o token é
 * renovado (proativa ou reativamente). */
export function writeSessionCookies(response: NextResponse, session: SessionData): void {
  const renewAt = Date.now() + session.expiresIn * RENEW_RATIO * 1000;

  response.cookies.set(
    COOKIE.accessToken,
    session.accessToken,
    cookieOptions("/", session.expiresIn, true),
  );
  // path=/api/auth de propósito: o proxy genérico de dados nunca recebe o
  // refresh token do browser, só as rotas que precisam dele.
  response.cookies.set(
    COOKIE.refreshToken,
    session.refreshToken,
    cookieOptions("/api/auth", SEVEN_DAYS_SECONDS, true),
  );
  response.cookies.set(
    COOKIE.renewAt,
    String(renewAt),
    cookieOptions("/", SEVEN_DAYS_SECONDS, true),
  );
  writeUserCookie(response, session.user);
}

/** Regrava só o `vz_user` — usado na reidratação de `/api/auth/session`
 * quando o accessToken existente ainda vale (sem precisar renovar tokens). */
export function writeUserCookie(response: NextResponse, user: SessionUser): void {
  response.cookies.set(
    COOKIE.user,
    JSON.stringify(user),
    cookieOptions("/", SEVEN_DAYS_SECONDS, false),
  );
}

export function clearSessionCookies(response: NextResponse): void {
  response.cookies.set(COOKIE.accessToken, "", cookieOptions("/", 0, true));
  response.cookies.set(COOKIE.refreshToken, "", cookieOptions("/api/auth", 0, true));
  response.cookies.set(COOKIE.renewAt, "", cookieOptions("/", 0, true));
  response.cookies.set(COOKIE.user, "", cookieOptions("/", 0, false));
}
