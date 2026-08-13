"use client";

import { useState, type ReactNode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";

import { createQueryClient } from "@/lib/query-client";

export function Providers({ children }: { children: ReactNode }) {
  // useState garante um client por sessão de navegador, não um por render.
  const [client] = useState(createQueryClient);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
