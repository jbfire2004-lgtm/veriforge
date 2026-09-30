import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { adminSocialPostFlags } from "@/lib/moderation/api";
import { SocialPostFlagsClient } from "@/components/moderation/SocialPostFlagsClient";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminSocialModerationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/admin/moderation/social");

  const flags = await adminSocialPostFlags(session).catch(() => ({
    items: [],
    total: 0,
    page: 1,
    pageSize: 25,
  }));

  return (
    <AdminPageShell
      title="Social post reports"
      description="Review reports filed from the Verus social homepage feed."
    >
      <Link
        href="/admin/moderation"
        className="mb-vera-6 inline-block text-sm text-vera-teal hover:underline"
      >
        ← Back to moderation queue
      </Link>
      <p className="mb-vera-4 text-sm text-vera-muted">
        {flags.total} open report{flags.total === 1 ? "" : "s"}
      </p>
      <SocialPostFlagsClient initial={flags.items} />
    </AdminPageShell>
  );
}
