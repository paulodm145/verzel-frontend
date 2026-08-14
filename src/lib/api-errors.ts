export interface ApiErrorDetail {
  path: string;
  message: string;
}

/** Erro no formato único da API: { error: { code, message, details?, requestId } }. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    message: string,
    readonly details?: ApiErrorDetail[],
    readonly requestId?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const FALLBACK_MESSAGE = "Falha inesperada ao falar com o servidor";

function isDetailList(value: unknown): value is ApiErrorDetail[] {
  return (
    Array.isArray(value) &&
    value.every(
      (item) =>
        typeof item === "object" &&
        item !== null &&
        typeof (item as ApiErrorDetail).path === "string" &&
        typeof (item as ApiErrorDetail).message === "string",
    )
  );
}

export function parseApiError(status: number, body: unknown): ApiError {
  const envelope =
    typeof body === "object" && body !== null ? (body as { error?: unknown }).error : undefined;

  if (typeof envelope !== "object" || envelope === null) {
    return new ApiError(status, "UNKNOWN", FALLBACK_MESSAGE);
  }

  const { code, message, details, requestId } = envelope as Record<string, unknown>;

  return new ApiError(
    status,
    typeof code === "string" ? code : "UNKNOWN",
    typeof message === "string" ? message : FALLBACK_MESSAGE,
    isDetailList(details) ? details : undefined,
    typeof requestId === "string" ? requestId : undefined,
  );
}

export function isApiError(value: unknown): value is ApiError {
  return value instanceof ApiError;
}
