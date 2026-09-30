import { Suspense } from "react";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth-options";
import { sessionRole } from "@/lib/phase1-roles";
import { FieldDashboard } from "@/components/field";
import { resolveSearchParams } from "@/lib/resolve-search-params";

export const metadata = {
  title: "FieldOS Live Binder — Vera",
  description:
    "Live field binder: Equipment Readiness, Crew Readiness, Safety Pulse, Task Sync, Incident Capture, Offline Mode, Analytics Snapshot.",
};

export default async function FieldPage({
  searchParams,
}: {
  searchParams: Promise<{ projectId?: string; companyId?: string }>;
}) {
  const session = await getServerSession(authOptions);
  const role = sessionRole(session);
  const sp = await resolveSearchParams(searchParams);
  const projectId = sp.projectId ? parseInt(sp.projectId, 10) : undefined;
  const companyId = sp.companyId
    ? parseInt(sp.companyId, 10)
    : (session?.user as { companyId?: number } | undefined)?.companyId;

  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">Loading binder…</p>}>
      <FieldDashboard
        role={role}
        companyId={Number.isFinite(companyId) ? companyId : undefined}
        projectId={Number.isFinite(projectId) ? projectId : undefined}
      />
    </Suspense>
  );
}
