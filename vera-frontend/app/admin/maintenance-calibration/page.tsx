import Link from "next/link";
import { apiGetSafe } from "@/lib/api";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent, ErrorState } from "@/components/ui";
import { buttonStyles } from "@/components/ui/button";
import type { McDashboard } from "@/lib/api/maintenance-calibration";

export default async function MaintenanceCalibrationHubPage() {
  const res = await apiGetSafe<McDashboard>("/api/v1/maintenance-calibration/dashboard");

  return (
    <AdminPageShell
      title="Maintenance & calibration"
      description="Fleet maintenance records, calibration certificates, and due schedules."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Maintenance & calibration" },
      ]}
    >
      {!res.ok ? (
        <ErrorState title="Dashboard unavailable" description={res.error} />
      ) : (
        <section className="space-y-6">
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Maintenance records" value={res.data.maintenanceRecordCount} />
            <Stat label="Maintenance overdue" value={res.data.maintenanceOverdue} warn />
            <Stat label="Due ≤14 days (maint.)" value={res.data.maintenanceDueWithin14Days} warn />
            <Stat label="Calibration records" value={res.data.calibrationRecordCount} />
            <Stat label="Calibration overdue" value={res.data.calibrationOverdue} warn />
            <Stat label="Due ≤14 days (cal.)" value={res.data.calibrationDueWithin14Days} warn />
          </section>

          <section className="flex flex-wrap gap-3">
            <Link href="/admin/maintenance-calibration/maintenance" className={buttonStyles({ variant: "teal" })}>
              Maintenance dashboard
            </Link>
            <Link href="/admin/maintenance-calibration/calibration" className={buttonStyles({ variant: "outline" })}>
              Calibration dashboard
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
}: {
  label: string;
  value: number;
  warn?: boolean;
}) {
  return (
    <Card>
      <CardContent className="pt-6">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-semibold ${warn && value > 0 ? "text-amber-700" : ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
