import type { NextRequest, NextResponse } from "next/server";

import { handleAuthEntry } from "@/server/route-helpers";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const credentials: unknown = await request.json().catch(() => ({}));
  return handleAuthEntry("/auth/login", credentials);
}
