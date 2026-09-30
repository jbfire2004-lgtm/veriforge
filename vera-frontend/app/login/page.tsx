import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { defaultPostLoginPath } from "@/lib/phase1-roles";
import { resolveSearchParams } from "@/lib/resolve-search-params";
import { resolveSessionRole } from "@/lib/session-role";

/** Legacy path: real login UI lives at `/auth/login`. */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }> | { callbackUrl?: string };
}) {
  const session = await getServerSession(authOptions);
  if (session) redirect(defaultPostLoginPath(resolveSessionRole(session)));
  const sp = await resolveSearchParams(searchParams);
  const q = sp.callbackUrl
    ? `?callbackUrl=${encodeURIComponent(sp.callbackUrl)}`
    : "";
  redirect(`/auth/login${q}`);
}
