/** Aceita apenas caminhos internos absolutos para impedir redirecionamento aberto. */
export function safeNextPath(nextPath?: string): string | undefined {
  return nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : undefined;
}
