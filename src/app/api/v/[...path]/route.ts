import type { NextRequest, NextResponse } from "next/server";

import { proxyToApi } from "@/server/proxy";

interface RouteContext {
  params: Promise<{ path: string[] }>;
}

async function handle(request: NextRequest, { params }: RouteContext): Promise<NextResponse> {
  const { path } = await params;
  return proxyToApi(request, path);
}

export { handle as DELETE, handle as GET, handle as PATCH, handle as POST, handle as PUT };
