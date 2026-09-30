import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { ReportingOverview } from "@/lib/api/reporting";

const DASHBOARDS = [
  { href: "/admin/reporting/workers", label: "Worker compliance", desc: "Training & credential compliance by worker" },
  { href: "/admin/reporting/equipment", label: "Equipment compliance", desc: "Fleet status, lockouts, overdue inspections" },
  { href: "/admin/reporting/competency", label: "Competency status", desc: "Evaluations, expiring competency" },
  { href: "/admin/reporting/inspections", label: "Inspection status", desc: "Pass/fail rates and due inspections" },
  { href: "/admin/reporting/projects", label: "Project readiness", desc: "Worker & equipment readiness per project" },
  { href: "/admin/reporting/companies", label: "Company readiness", desc: "Composite readiness score" },
  { href: "/admin/reporting/union-halls", label: "Union dispatch", desc: "Hall dispatch volume and activity" },
] as const;

export default async function ReportingHubPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const { companyId } = await searchParams;
  const qs = companyId ? `?companyId=${companyId}` : "";
  const res = await apiGetSafe<ReportingOverview>(`/api/v1/reporting/overview${qs}`);

  return (
    <AdminPageShell
      title="Reporting & dashboards"
      description="Aggregated compliance, readiness, and dispatch metrics with filters and CSV export."
      breadcrumbs={[{ label: "Admin", href: "/admin" }, { label: "Reporting" }]}
    >
      {!res.ok ? (
        <ErrorState title="Overview unavailable" description={res.error} />
      ) : (
        <section className="space-y-8">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Snapshot
              label="Worker compliance rate"
              value={`${(res.data.workers as { summary?: { complianceRate?: number } })?.summary?.complianceRate ?? 0}%`}
            />
            <Snapshot
              label="Equipment compliance rate"
              value={`${(res.data.equipment as { summary?: { complianceRate?: number } })?.summary?.complianceRate ?? 0}%`}
            />
            <Snapshot
              label="Inspection pass rate"
              value={`${(res.data.inspections as { summary?: { passRate?: number } })?.summary?.passRate ?? 0}%`}
            />
            <Snapshot
              label="Avg project readiness"
              value={`${(res.data.projects as { summary?: { averageReadiness?: number } })?.summary?.averageReadiness ?? 0}%`}
            />
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {DASHBOARDS.map((d) => (
              <Card key={d.href} className="transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 pt-6">
                  <h3 className="font-semibold">{d.label}</h3>
                  <p className="text-sm text-muted-foreground">{d.desc}</p>
                  <Link href={d.href} className={buttonStyles({ variant: "teal", size: "sm" })}>
                    Open dashboard
                  </Link>
                </CardContent>
              </Card>
            ))}
          </section>
        </section>
      )}
    </AdminPageShell>
  );
}

function Snapshot({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  );
}
