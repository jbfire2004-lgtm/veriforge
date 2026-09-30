import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const SAAS =
  process.env.VERIFORGE_SAAS_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SAAS_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:3020";

/** Proxies VeriHub org login → SaaS POST /auth/login (avoids clash with [...nextauth]). */
export async function POST(req: NextRequest) {
  const dest = `${SAAS}/auth/login`;
  const headers = new Headers();
  const ct = req.headers.get("content-type");
  if (ct) headers.set("Content-Type", ct);
  const upstream = await fetch(dest, {
    method: "POST",
    headers,
    body: await req.arrayBuffer(),
    redirect: "manual",
  });
  const out = new Headers(upstream.headers);
  out.delete("transfer-encoding");
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  });
}
