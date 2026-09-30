import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import {
  Card,
  CardContent,
  ErrorState,
} from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { ToolsPpeDashboard } from "@/lib/api/tools-ppe";

export default async function ToolsPpeDashboardPage() {
  const res = await apiGetSafe<ToolsPpeDashboard>("/api/v1/tools-ppe/dashboard");

  return (
    <AdminPageShell
      title="Tools & PPE"
      description="Track tools, personal protective equipment, inspections, and assignments."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Tools & PPE" },
      ]}
      actions={
        <section className="flex flex-wrap gap-2">
          <Link href="/admin/tools-ppe/tools/new" className={buttonStyles({ variant: "teal", size: "sm" })}>
            Add tool
          </Link>
          <Link href="/admin/tools-ppe/ppe/new" className={buttonStyles({ variant: "outline", size: "sm" })}>
            Add PPE
          </Link>
        </section>
      }
    >
      {!res.ok ? (
        <ErrorState title="Dashboard unavailable" description={res.error} />
      ) : (
        <section className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="Tools" value={res.data.toolCount} />
            <Stat label="Inspection due" value={res.data.toolsInspectionDue} warn />
            <Stat label="PPE items" value={res.data.ppeCount} />
            <Stat label="PPE expired" value={res.data.ppeExpired} danger />
            <Stat label="PPE expiring ≤30d" value={res.data.ppeExpiringSoon} warn />
            <Stat label="Tools assigned" value={res.data.activeToolAssignments} />
            <Stat label="PPE assigned" value={res.data.activePpeAssignments} />
          </section>

          {(res.data.ppeExpired > 0 || res.data.ppeExpiringSoon > 0) && (
            <Card className="border-amber-300 bg-amber-50">
              <CardContent className="flex flex-wrap items-center justify-between gap-4 pt-6">
                <p className="text-sm text-amber-900">
                  {res.data.ppeExpired} expired and {res.data.ppeExpiringSoon} PPE items expiring within 30 days.
                </p>
                <Link href="/admin/tools-ppe/ppe" className={buttonStyles({ variant: "outline", size: "sm" })}>
                  Review PPE
                </Link>
              </CardContent>
            </Card>
          )}

          <section className="flex flex-wrap gap-3">
            <Link href="/admin/tools-ppe/tools" className={buttonStyles({ variant: "outline" })}>
              Tools registry
            </Link>
            <Link href="/admin/tools-ppe/ppe" className={buttonStyles({ variant: "outline" })}>
              PPE registry
            </Link>
          </section>
        </section>
      )}
    </AdminPageShell>
  );
}

function Stat({
  label,
  value,
  warn,
  danger,
}: {
  label: string;
  value: number;
  warn?: boolean;
  danger?: boolean;
}) {
  const tone = danger ? "text-red-700" : warn ? "text-amber-700" : "text-foreground";
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold ${tone}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
