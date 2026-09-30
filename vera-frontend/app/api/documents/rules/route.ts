import { type NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const SAAS =
  process.env.VERIFORGE_SAAS_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_SAAS_URL?.replace(/\/$/, "") ||
  "http://127.0.0.1:3020";

export async function GET(req: NextRequest) {
  const dest = `${SAAS}/documents/rules${new URL(req.url).search}`;
  const headers = new Headers();
  const auth = req.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);
  const upstream = await fetch(dest, { headers, redirect: "manual" });
  return new Response(upstream.body, {
    status: upstream.status,
    headers: upstream.headers,
  });
}
