import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const SAAS =
  process.env.VERIFORGE_SAAS_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SAAS_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:3020";

const STRIP_REQ = new Set([
  "host",
  "connection",
  "content-length",
  "transfer-encoding",
]);

/** Proxy GET/POST /api/notifications → SaaS /notifications */
async function proxy(req: NextRequest) {
  const dest = `${SAAS}/notifications${new URL(req.url).search}`;
  const headers = new Headers();
  req.headers.forEach((value, key) => {
    if (!STRIP_REQ.has(key.toLowerCase())) headers.set(key, value);
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

export const GET = proxy;
export const POST = proxy;
