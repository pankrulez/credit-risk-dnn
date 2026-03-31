// src/app/api/proxy/[...path]/route.ts
import { NextRequest, NextResponse } from "next/server";

const RENDER_API_URL = process.env.RENDER_API_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, "GET");
}

export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, "POST");
}

export async function HEAD(
  req: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(req, params.path, "HEAD");
}

async function proxyRequest(
  req: NextRequest,
  pathSegments: string[],
  method: string
): Promise<NextResponse> {
  if (!RENDER_API_URL) {
    return NextResponse.json(
      { detail: "RENDER_API_URL is not set in environment variables." },
      { status: 503 }
    );
  }

  const targetPath = pathSegments.join("/");
  const targetUrl  = `${RENDER_API_URL}/${targetPath}${req.nextUrl.search}`;

  try {
    const body = method !== "GET" && method !== "HEAD"
      ? await req.text()
      : undefined;

    const res = await fetch(targetUrl, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept":        "application/json",
      },
      body,
      signal: AbortSignal.timeout(65000),   // 65s — handles Render cold start
    });

    const contentType = res.headers.get("content-type") || "";
    const data = contentType.includes("application/json")
      ? await res.json()
      : await res.text();

    return NextResponse.json(data, { status: res.status });

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Proxy error";
    const isTimeout = msg.includes("timeout") || msg.includes("abort");
    return NextResponse.json(
      {
        detail: isTimeout
          ? "Render cold start timeout — please retry in 30 seconds"
          : `Proxy error: ${msg}`,
      },
      { status: isTimeout ? 504 : 502 }
    );
  }
}