import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const SAAS =
  process.env.VERIFORGE_SAAS_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SAAS_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:3020";

const STRIP = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
]);

async function proxy(
  req: NextRequest,
  ctx?: { params: Promise<{ path?: string[] }> },
) {
  const path = ctx ? (await ctx.params).path : undefined;
  const suffix = path?.length ? `/${path.join("/")}` : "";
  const dest = `${SAAS}/quickcheck${suffix}${new URL(req.url).search}`;
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP.has(key.toLowerCase())) headers.set(key, value);
  });
  const init: RequestInit = {
    method: req.method,
    headers,
    redirect: "manual",
  };
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }
  const upstream = await fetch(dest, init);
  const out = new Headers(upstream.headers);
  out.delete("transfer-encoding");
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  });
}

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxy(req, ctx);
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  return proxy(req, ctx);
}

export const PUT = POST;
export const PATCH = POST;
export const DELETE = POST;
export const OPTIONS = GET;
