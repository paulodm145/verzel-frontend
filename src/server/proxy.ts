/**
 * Lógica compartilhada do proxy genérico `/api/v/[...path]` (spec seção 2.5).
 * Três responsabilidades numa função só, nesta ordem:
 *
 * 1. Renovação proativa: se `vz_renew_at` já passou, renova antes de
 *    encaminhar — o 401 de expiração de rotina não deveria nunca acontecer.
 * 2. Encaminha com allowlist de cabeçalhos de entrada e expõe
 *    `Idempotency-Replayed` na volta.
 * 3. Fallback reativo: um único retry em 401. Em 403 nunca renova — papel
 *    insuficiente não é sessão expirada, e tratar os dois igual gera laço de
 *    renovação que termina deslogando por reuso de token (spec seção 2.4).
 */
import { NextResponse, type NextRequest } from "next/server";

import { apiRaw } from "./api-client";
import { renewSession } from "./refresh";
import { clearSessionCookies, readSessionCookies, writeSessionCookies } from "./session";

/** Allowlist, não denylist: repassar tudo às cegas é como um proxy vaza
 * cabeçalho que não devia. */
const FORWARDED_REQUEST_HEADERS = ["content-type", "idempotency-key"];
const EXPOSED_RESPONSE_HEADERS = ["idempotency-replayed"];
const BODYLESS_METHODS = new Set(["GET", "HEAD"]);

function pickForwardedHeaders(source: Headers): Headers {
  const headers = new Headers();
  for (const name of FORWARDED_REQUEST_HEADERS) {
    const value = source.get(name);
    if (value) headers.set(name, value);
  }
  return headers;
}

function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Sessão inválida ou expirada" } },
    { status: 401 },
  );
}

async function forwardResponse(response: Response): Promise<NextResponse> {
  const text = await response.text();
  const headers = new Headers();

  const contentType = response.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);

  for (const name of EXPOSED_RESPONSE_HEADERS) {
    const value = response.headers.get(name);
    if (value) headers.set(name, value);
  }

  return new NextResponse(text || null, { status: response.status, headers });
}

export async function proxyToApi(request: NextRequest, segments: string[]): Promise<NextResponse> {
  const session = readSessionCookies(request);
  if (!session.accessToken) return unauthorized();

  let accessToken = session.accessToken;
  let refreshToken = session.refreshToken;
  let expiresIn: number | undefined;

  if (session.renewAt !== undefined && Date.now() >= session.renewAt && refreshToken) {
    const fresh = await renewSession(refreshToken).catch(() => null);
    if (fresh) ({ accessToken, refreshToken, expiresIn } = fresh);
  }

  const path = `/${segments.join("/")}`;
  const search = request.nextUrl.search;
  const headers = pickForwardedHeaders(request.headers);
  const body = BODYLESS_METHODS.has(request.method) ? undefined : await request.text();

  let response = await apiRaw(`${path}${search}`, {
    method: request.method,
    headers,
    body,
    accessToken,
  });

  // Fallback reativo: só entra aqui se a renovação proativa não bastou (ou
  // não rodou). 403 nunca cai neste bloco — é outro `if`, não um `else`.
  if (response.status === 401 && refreshToken) {
    const fresh = await renewSession(refreshToken).catch(() => null);
    if (fresh) {
      ({ accessToken, refreshToken, expiresIn } = fresh);
      response = await apiRaw(`${path}${search}`, {
        method: request.method,
        headers,
        body,
        accessToken,
      });
    }
  }

  const nextResponse = await forwardResponse(response);

  if (response.status === 401) {
    // Segundo 401 seguido (ou renovação impossível): sessão morta de fato.
    clearSessionCookies(nextResponse);
  } else if (expiresIn !== undefined && refreshToken && session.user) {
    writeSessionCookies(nextResponse, { accessToken, refreshToken, expiresIn, user: session.user });
  }

  return nextResponse;
}
