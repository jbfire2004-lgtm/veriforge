import { apiFetchJson } from "@/lib/api-fetch";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import {
  AdminDashboardView,
  type AdminActivityRow,
  type AdminDashboardStats,
} from "./AdminDashboardView";

async function getStats(
  accessToken?: string
): Promise<{ ok: true; stats: AdminDashboardStats } | { ok: false; message: string }> {
  try {
    const summary = await apiFetchJson<AdminDashboardStats>(
      "/phase1/dashboard-summary",
      {
        cache: "no-store",
        ...(accessToken
          ? {
              headers: { Authorization: `Bearer ${accessToken}` },
            }
          : {}),
      }
    );
    return { ok: true, stats: summary };
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Could not load dashboard statistics.";
    return { ok: false, message };
  }
}

function buildActivityRows(
  result: Awaited<ReturnType<typeof getStats>>
): AdminActivityRow[] {
  const now = new Date();
  const time = now.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });

  const rows: AdminActivityRow[] = [
    {
      id: "load",
      when: time,
      summary:
        result.ok === true
          ? "Dashboard metrics loaded from Phase 1 summary API."
          : "Dashboard loaded; metrics request did not complete successfully.",
      area: "Admin",
      tone: result.ok ? undefined : "warning",
    },
  ];

  if (result.ok) {
    const { stats } = result;
    rows.push(
      {
        id: "workers",
        when: "Moments ago",
        summary: `${stats.workerCount} workers · ${stats.companyCount} companies · ${stats.trainingRecordCount} training records.`,
        area: "Directory",
      },
      {
        id: "alerts",
        when: "Moments ago",
        summary: `${stats.trainingAttentionCount} training record(s) expired or expiring soon · ${stats.credentialAttentionCount} credential(s) expired or expiring soon.`,
        area: "Compliance",
        tone:
          stats.trainingAttentionCount + stats.credentialAttentionCount > 0
            ? "warning"
            : "default",
      },
      {
        id: "equipment",
        when: "Moments ago",
        summary: `${stats.equipmentCount} equipment records · ${stats.unsafeEquipmentCount} flagged unsafe.`,
        area: "Assets",
        tone: stats.unsafeEquipmentCount > 0 ? "danger" : "default",
      },
      {
        id: "uploads",
        when: "Moments ago",
        summary: `${stats.recentUploads.length} recent upload row(s) in the snapshot (documents + training ingest).`,
        area: "Evidence",
      }
    );
  }

  return rows;
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect(`/auth/login?callbackUrl=${encodeURIComponent("/admin")}`);
  }
  const result = await getStats(session.accessToken);
  const stats = result.ok ? result.stats : null;
  const activityRows = buildActivityRows(result);

  return (
    <AdminDashboardView
      stats={stats}
      statsError={result.ok ? null : result.message}
      activityRows={activityRows}
    />
  );
}
