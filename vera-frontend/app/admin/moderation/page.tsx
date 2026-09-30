import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { adminModerationQueue, adminModerationStats } from "@/lib/moderation/api";
import { ModerationQueueClient } from "@/components/moderation/ModerationQueueClient";
import { AdminPageShell } from "@/components/admin/AdminPageShell";

export default async function AdminModerationPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login?callbackUrl=/admin/moderation");

  const [stats, queue] = await Promise.all([
    adminModerationStats(session).catch(() => ({
      open: 0,
      inReview: 0,
      autoFlaggedOpen: 0,
      socialPostFlagsOpen: 0,
    })),
    adminModerationQueue(session, { status: "OPEN" }).catch(() => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 25,
    })),
  ]);

  return (
    <AdminPageShell
      title="Moderation queue"
      description="Review user reports and auto-flagged content."
    >
      <div className="flex flex-wrap gap-vera-4 text-sm mb-vera-6">
        <Link href="/admin/moderation/rules" className="text-vera-teal hover:underline">
          Auto-flag rules
        </Link>
        <Link
          href="/admin/moderation/experts"
          className="text-vera-teal hover:underline"
        >
          Expert verification
        </Link>
        <Link
          href="/admin/moderation/social"
          className="text-vera-teal hover:underline"
        >
          Social post reports
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-vera-4 mb-vera-6 text-sm sm:grid-cols-4">
        <div className="rounded-lg border border-vera-border p-vera-3">
          <p className="text-vera-muted">Open</p>
          <p className="text-2xl font-semibold">{stats.open}</p>
        </div>
        <div className="rounded-lg border border-vera-border p-vera-3">
          <p className="text-vera-muted">In review</p>
          <p className="text-2xl font-semibold">{stats.inReview}</p>
        </div>
        <div className="rounded-lg border border-vera-border p-vera-3">
          <p className="text-vera-muted">Auto-flagged</p>
          <p className="text-2xl font-semibold">{stats.autoFlaggedOpen}</p>
        </div>
        <div className="rounded-lg border border-vera-border p-vera-3">
          <p className="text-vera-muted">Social posts</p>
          <p className="text-2xl font-semibold">{stats.socialPostFlagsOpen ?? 0}</p>
        </div>
      </div>
      <ModerationQueueClient initial={queue.items} />
    </AdminPageShell>
  );
}
